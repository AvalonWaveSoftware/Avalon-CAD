// Test entry point only; it is excluded from the installed app.
const {app, dialog} = require('electron');
const fs=require('node:fs/promises'),path=require('node:path');
dialog.showErrorBox=(title,message)=>{console.error(title,message);process.exit(2);};
app.on('browser-window-created',(_event,window)=>{window.webContents.on('console-message',event=>console.error('Renderer:',event.message));});
// This build host forbids AF_UNIX sockets; Mac singleton behavior is unchanged.
app.requestSingleInstanceLock=()=>true;
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('use-gl','angle');
app.commandLine.appendSwitch('use-angle','swiftshader');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');
dialog.showSaveDialog=async (_window,options)=>({canceled: process.env.AVALON_CANCEL_SAVE==='1',filePath:path.join(process.env.AVALON_TEST_FILES,path.basename(options.defaultPath))});
dialog.showOpenDialog=async ()=>({canceled: process.env.AVALON_CANCEL_OPEN==='1',filePaths:[path.join(process.env.AVALON_TEST_FILES,'phone.tcad')]});
require('../build/desktop-stage/main.cjs');
