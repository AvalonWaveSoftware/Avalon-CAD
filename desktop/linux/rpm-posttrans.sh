#!/bin/bash
# RPM %posttrans (wired via build.rpm.fpm --rpm-posttrans; fpm does NOT template this file, so values are literal).
# Runs after the old package's %postun, which in releases before this fix removed the
# /usr/bin/avalon-cad alternative on every upgrade/downgrade. Re-register it (same command as after-install).
if [ -x '/opt/Avalon CAD/avalon-cad' ]; then
  if type update-alternatives >/dev/null 2>&1; then
    update-alternatives --install '/usr/bin/avalon-cad' 'avalon-cad' '/opt/Avalon CAD/avalon-cad' 100 || ln -sf '/opt/Avalon CAD/avalon-cad' '/usr/bin/avalon-cad'
  else
    ln -sf '/opt/Avalon CAD/avalon-cad' '/usr/bin/avalon-cad'
  fi
fi
exit 0
