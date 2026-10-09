import React from 'react';
import { IconX, IconDownload, IconCheck } from './Icons';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPwaInstall?: () => void;
  canInstallPwa: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerPwaInstall,
  canInstallPwa
}) => {
  if (!isOpen) return null;

  const handleDownloadBat = () => {
    const batContent = `@echo off
title ASK MOTORS - 1-Click Desktop Installer
color 0A
echo ========================================================
echo        ASK MOTORS - Vehicle Registration & Accounts
echo                   Desktop App Installation
echo ========================================================
echo.
set "APP_URL=${window.location.origin}"
set "BROWSER="
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"
if not defined BROWSER if exist "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER=%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" set "BROWSER=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
 "$ws = New-Object -ComObject WScript.Shell;" ^
 "$d = [Environment]::GetFolderPath('Desktop') + '\\ASK MOTORS.lnk';" ^
 "$sm = [Environment]::GetFolderPath('Programs') + '\\ASK MOTORS.lnk';" ^
 "foreach($p in @($d, $sm)){ if($p){ try { $s = $ws.CreateShortcut($p); $s.TargetPath = '%BROWSER%'; $s.Arguments = '--app=\"%APP_URL%\"'; $s.Description = 'ASK MOTORS Vehicle Registration and Accounts'; $s.Save(); } catch {} } }"

echo Success! Shortcut placed on Desktop.
start "" "%BROWSER%" --app="%APP_URL%"
exit`;

    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'INSTALL_ASK_MOTORS.bat';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-back">
      <div className="modal sm" role="dialog" aria-modal="true" aria-label="Install ASK MOTORS App">
        <div className="modal-h">
          <h3>Install App on PC &amp; Mobile</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        <div className="modal-b" style={{ fontSize: '13px', lineHeight: '1.6' }}>
          {/* Quick 1-click PWA button if supported */}
          {canInstallPwa && onTriggerPwaInstall && (
            <div style={{
              background: 'var(--primary-soft)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--r)',
              padding: '14px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <b style={{ color: 'var(--primary)', display: 'block', fontSize: '14px', marginBottom: '6px' }}>
                ⚡ 1-Click Direct Browser Installation Ready
              </b>
              <button 
                className="btn primary" 
                onClick={onTriggerPwaInstall}
                style={{ width: '100%', justifyContent: 'center', height: '40px' }}
              >
                <IconDownload /> Install ASK MOTORS Now
              </button>
            </div>
          )}

          {/* Windows PC guide */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '12px 14px',
            marginBottom: '12px'
          }}>
            <b style={{ display: 'block', fontSize: '13.5px', marginBottom: '4px' }}>
              💻 Windows Computer / Laptop (Chrome / Edge)
            </b>
            <ol style={{ paddingLeft: '18px', margin: '4px 0' }}>
              <li>Browser ke address bar ke right corner par <b>Install icon (⊕ ya monitor)</b> dabayein.</li>
              <li>Ya browser menu (<b>⋮</b>) par click karein → <b>"Save and share"</b> → <b>"Install page as app"</b>.</li>
              <li><b>"Install"</b> dabayein — Desktop par icon ban jayega aur app alag software window mein chalegi.</li>
            </ol>
            <div style={{ marginTop: '8px' }}>
              <button className="btn sm" onClick={handleDownloadBat}>
                <IconDownload /> Download 1-Click INSTALL.bat Script
              </button>
            </div>
          </div>

          {/* Android Mobile guide */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '12px 14px',
            marginBottom: '12px'
          }}>
            <b style={{ display: 'block', fontSize: '13.5px', marginBottom: '4px' }}>
              📱 Android Mobile (Google Chrome / Brave)
            </b>
            <ol style={{ paddingLeft: '18px', margin: '4px 0' }}>
              <li>Mobile Chrome mein yeh link open karein.</li>
              <li>Upar right corner par <b>⋮ (3 dots)</b> dabayein.</li>
              <li><b>"Install app"</b> ya <b>"Add to Home screen"</b> par tap karein.</li>
              <li>Mobile Home Screen par ASK MOTORS ka icon ban jayega jo baghair browser URL ke mobile app ki tarah chalega.</li>
            </ol>
          </div>

          {/* iPhone / iPad guide */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '12px 14px'
          }}>
            <b style={{ display: 'block', fontSize: '13.5px', marginBottom: '4px' }}>
              🍏 iPhone / iPad (Safari)
            </b>
            <ol style={{ paddingLeft: '18px', margin: '4px 0' }}>
              <li>Safari browser mein app kholein.</li>
              <li>Neeche <b>Share button (□↑)</b> dabayein.</li>
              <li>List mein neeche scroll karke <b>"Add to Home Screen"</b> par tap karein, phir <b>"Add"</b> dabayein.</li>
            </ol>
          </div>
        </div>

        <div className="modal-f">
          <button className="btn primary" onClick={onClose}>
            <IconCheck /> Samajh Gaya (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
