// WS9 (BUNDLE_SPLIT): which worker jobs must wait for OCCT. Only a job on an empty project is known not to touch it
// (no shapes, so no topology, fillets or B-reps); everything else, including unknown job types, waits.
export const needsSolid=data=>!(['preview','check','export','groundProject'].includes(data?.type)&&Array.isArray(data?.project?.objects)&&data.project.objects.length===0);
