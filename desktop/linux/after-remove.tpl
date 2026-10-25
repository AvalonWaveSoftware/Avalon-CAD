#!/bin/bash
# Avalon CAD after-remove script (replaces electron-builder's default after-remove.tpl).
# RPM %postun gets $1 = installed instances left: 0 = erase, >=1 = upgrade/downgrade (old package's
# postun runs AFTER the new package's post, so removing the alternative here would delete /usr/bin/avalon-cad).
# deb postrm gets "remove"/"purge" on a real removal, "upgrade"/"failed-upgrade"/"abort-*" otherwise.
# pacman (fpm) runs this only as post_remove (upgrades use post_upgrade), $1 = old version string.
is_erase=1
case "${1:-}" in
  ''|0|remove|purge) is_erase=1 ;;
  upgrade|failed-upgrade|abort-install|abort-upgrade|disappear) is_erase=0 ;;
  *) if [[ "$1" =~ ^[0-9]+$ ]]; then is_erase=0; fi ;;  # RPM upgrade/downgrade ($1 >= 1)
esac
[ "$is_erase" = 1 ] || exit 0

# Delete the link to the binary
if type update-alternatives >/dev/null 2>&1; then
    update-alternatives --remove '${executable}' '/opt/${sanitizedProductName}/${executable}'
else
    rm -f '/usr/bin/${executable}'
fi

# Remove now-empty install dirs left behind (only if empty; never rm -rf).
for d in locales resources/web/licenses resources/web resources; do
  rmdir --ignore-fail-on-non-empty "/opt/${sanitizedProductName}/$d" 2>/dev/null || true
done
rmdir --ignore-fail-on-non-empty '/opt/${sanitizedProductName}' 2>/dev/null || true

APPARMOR_PROFILE_DEST='/etc/apparmor.d/${executable}'
if [ -f "$APPARMOR_PROFILE_DEST" ]; then
  if apparmor_status --enabled > /dev/null 2>&1; then
    if ! { [ -x '/usr/bin/ischroot' ] && /usr/bin/ischroot; } && hash apparmor_parser 2>/dev/null; then
      apparmor_parser --remove "$APPARMOR_PROFILE_DEST" || true
    fi
  fi
  rm -f "$APPARMOR_PROFILE_DEST"
fi
exit 0
