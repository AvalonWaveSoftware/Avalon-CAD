"""AvalonCad's local Python model assembly and command processing.

Solid handles stay inside the compiled modeling libraries. Large vertex buffers
stay in JavaScript/WebAssembly memory, without conversion to Python lists.
"""
import math
import sys
from pyodide.ffi import to_js
import avalon_native as native

TYPES = {"box", "rounded", "cylinder", "cone", "sphere", "tube", "threadrod", "threadtube", "polygon", "mesh", "joined", "wedge", "pyramid", "prefab"}

def field(obj, name, default=None):
    value = getattr(obj, name, default)
    return default if value is None else value

def validate_objects(objects):
    if len(objects) > 100:
        raise ValueError("Maximum 100 objects per project.")
    ids = set()
    for obj in objects:
        if field(obj, "type") not in TYPES or not isinstance(field(obj, "id"), str) or obj.id in ids:
            raise ValueError("Project contains an invalid object.")
        ids.add(obj.id)
        for key in ("position", "rotation"):
            values = field(obj, key)
            if values is None or len(values) != 3 or any(not math.isfinite(v) or abs(v) > 10000 for v in values):
                raise ValueError("Invalid object coordinates.")

def build_model(project, tolerance, individual=False):
    if field(project, "format") != "tristancad" or field(project, "version") != 1:
        raise ValueError("This is not a supported AvalonCad project.")
    validate_objects(project.objects)
    native.validate_layers(project)
    owned, parts, solids, cuts, adjustments = [], [], [], [], []
    styles = native.styles() if individual else None
    def own(solid):
        owned.append(solid)
        return solid
    try:
        for obj in project.objects:
            if field(obj, "enabled", True) is False:
                continue
            solid = own(native.make_object(obj, tolerance, styles))
            if field(project, "buildPlaneEnabled", False):
                grounded = native.floor_solid(obj, solid)
                if grounded:
                    solid = own(grounded.solid)
                    adjustments.append(grounded.adjustment)
            (cuts if field(obj, "mode") == "cut" else solids).append((obj, solid))
            if individual:
                parts.append(native.part(obj, solid, styles))
        if not solids:
            model = native.empty_result(to_js(parts), styles)
            model.floorAdjustments = to_js(adjustments)
            return model
        # Keep per-object cutout exclusions and overlap filling identical to the
        # saved .tcad contract, including cutouts shared with unselected pieces.
        groups = {}
        for obj, solid in solids:
            excluded = set(field(obj, "excludedCutouts", []))
            active = [(c, s) for c, s in cuts if field(c, "layerId", "layer-1") == field(obj, "layerId", "layer-1") and c.id not in excluded]
            key = tuple(c.id for c, _ in active)
            if key not in groups:
                groups[key] = ([], [s for _, s in active])
            groups[key][0].append(solid)
        material = []
        for group_solids, group_cuts in groups.values():
            merged = own(native.union(to_js(group_solids)))
            if group_cuts:
                merged = own(merged.subtract(own(native.union(to_js(group_cuts)))))
            material.append(merged)
        result = own(native.union(to_js(material)))
        if result.status() != "NoError":
            raise ValueError("Could not build the solid: " + result.status())
        model = native.model_result(result, to_js(parts), styles)
        model.floorAdjustments = to_js(adjustments)
        return model
    finally:
        for solid in owned:
            native.dispose(solid)

def evaluate_boolean(job):
    objects, operation = job.objects, job.operation
    tolerance = field(job, "tolerance", .03)
    cutouts = field(job, "cutouts", [])
    if operation not in ("add", "subtract"):
        raise ValueError("Choose Add or Subtract.")
    if operation == "subtract" and len(objects) < 2:
        raise ValueError("Select at least two shapes: first the cutter, then the parts to keep.")
    if operation == "add" and (not len(objects) or len(objects) < 2 and not len(cutouts)):
        raise ValueError("Select at least two shapes to add together.")
    validate_objects(list(objects) + list(cutouts))
    native.assert_same_layer(objects, cutouts)
    owned = []
    def own(solid):
        owned.append(solid)
        return solid
    try:
        prepared = [objects[0]] + list(native.subtract_targets(to_js(list(objects)[1:]), cutouts)) if operation == "subtract" else objects
        solids = [own(native.make_object(o, tolerance, None)) for o in prepared]
        removed_volume = target_volume = 0
        if operation == "subtract":
            cutter, target = solids[0], own(native.union(to_js(solids[1:])))
            target_volume = target.volume()
            overlap = own(target.intersect(cutter))
            removed_volume = overlap.volume()
            if overlap.isEmpty() or not removed_volume > 0:
                raise ValueError("These shapes do not overlap. Move the cutter through the part to keep.")
            result = own(target.subtract(cutter))
        else:
            cuts = own(native.union(to_js([own(native.make_object(o, tolerance, None)) for o in cutouts]))) if len(cutouts) else None
            if cuts is not None and field(job, "fillOverlaps", False):
                base = own(solids[0].subtract(cuts))
                result = own(native.union(to_js([base] + solids[1:])))
            else:
                result = own(native.union(to_js(solids)))
                if cuts is not None:
                    result = own(result.subtract(cuts))
        if result.status() != "NoError":
            raise ValueError("The operation could not produce a closed solid. Check the shapes and their overlap.")
        if result.isEmpty() or not result.volume() > 0:
            raise ValueError("The cutter removes the entire part. Reduce the cutter or change its position." if operation == "subtract" else "The selected shapes have no material remaining.")
        return native.boolean_result(result, removed_volume, target_volume)
    finally:
        for solid in owned:
            native.dispose(solid)

def process_job(job):
    """Return JS objects and typed buffers directly; never serialize mesh arrays."""
    try:
        kind = field(job, "type")
        if kind not in ("preview", "check", "export", "boolean", "conjoin", "place", "groundProject"):
            raise ValueError("Unsupported geometry command.")
        if kind == "place":
            result = native.place_object(job.object, job.position, field(job, "floor", False))
        elif kind == "groundProject":
            result = native.ground_project(job.project)
        elif kind == "boolean":
            result = evaluate_boolean(job)
        else:
            model = build_model(job.project, field(job, "tolerance", .15), kind == "preview")
            result = native.finish_result(model, kind, field(job, "ground", True))
        return native.response(result, field(job, "id"), kind)
    except Exception as error:
        return native.error_response(field(job, "id"), str(error))

def runtime_info():
    return native.runtime_info(sys.version.split()[0])
