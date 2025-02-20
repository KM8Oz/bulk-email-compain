// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri'
import { Store } from "tauri-plugin-store-api";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
// import {  } from '@tauri-apps/api/fs';
import { OsType, type, platform, Platform } from '@tauri-apps/api/os';
import macos_icon from '../assets/notification-icon.icns?raw';
// import macos_icon from '../assets/notification-icon.jpg?raw';
import win_icon from '../assets/notification-icon.ico?raw';
import linux_icon from '../assets/notification-icon.png?raw';
import { appDir, BaseDirectory } from '@tauri-apps/api/path';
import { fs, path } from '@tauri-apps/api';
import { pathsemailssmy, pathsettingsmy } from './catch';
// import { appDir, BaseDirectory, cacheDir, join } from '@tauri-apps/api/path';
// import { fs, path } from '@tauri-apps/api';
// import { cachdirmy, pathsemailssmy, pathsettingsmy } from './catch';
export const notify = async (title: string, body?: string) => {
    let _Platform = new ThisPlatform<string>(await platform());
    let icon = _Platform.select({
        macos: macos_icon,
        win: win_icon,
        linux: linux_icon,
        // linux: new URL('../assets/notification-icon.png?raw', import.meta.url).href,
    })
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
        title && body ? sendNotification({ title, body , icon}) : sendNotification({title:"Notification", body:title, icon });;
    }
}
// Be sure to set `build.withGlobalTauri` in `tauri.conf.json` to true
// const invoke = window.__TAURI__.invoke

// Invoke the command
export const checkemails = ({emails, sender, proxyurl, smtptimout}:{emails: string[], sender:string| null, proxyurl: string| null, smtptimout: number| null}): Promise<Array<{ email: string, status: string, data:string }>> => {
    let data = {emails, sender, proxyurl, smtptimout}
    return invoke('checkemails', {
        data
    }) as any;
}
export const stop_for_loop = (v:boolean) => {
    return invoke('loop_state', {
        data: {
            loop_state:v
        }
    }) as any;
}
export const export_to_exel = (data:string): Promise<any> => {
    return invoke('export_xlsx', {data}) as any;
}
export interface Proxy {
    host: string,
    /// Use the specified SOCKS5 proxy port to perform email verification.
    port: number,
    /// Username to pass to proxy authentication.
    username?: string,
    /// Password to pass to proxy authentication.
    password?: string,
}
export const check_proxy = (proxy:Proxy): Promise<any> => {
    return invoke('check_proxy', {proxy}) as any;
}
export const fastcheckemails = (emails: string[]): Promise<Array<{ email: string, status: boolean }>> => invoke('fastcheckemails', {
    emails
}) as any;
export class ThisPlatform<T> {
    static type: Platform;
    constructor(type: Platform) {
        (async ()=>{
            ThisPlatform.type = type;
        })()
    }
   public select({ linux, win, macos }: { linux: any, win: any, macos: any }):T {
        switch (ThisPlatform.type) {
            case 'win32':
                return win;
            case 'darwin':
                return macos;
            default:
                return linux;
        }
    }
}

export const loadall =  async ()=>{
    let _cacheDirPath = await path.cacheDir();
    let pathsettings = await path.join(_cacheDirPath, "_settings.dat");
    let pathsemails = await path.join(_cacheDirPath, "_emails.dat");
    pathsettingsmy.value = pathsettings;
    pathsemailssmy.value = pathsemails;
    let entries = await fs.readDir(_cacheDirPath, { dir:BaseDirectory.Cache, recursive:false });
    let pathsettingsexist = entries.map((s: { path: any; })=>s.path).includes(pathsettings);
    let pathsemailsexist = entries.map((s: { path: any; })=>s.path).includes(pathsemails);
    if(!pathsettingsexist) await fs.writeFile(pathsettings, "{}");
    if(!pathsemailsexist) await fs.writeFile(pathsemails, "{}");
};

// let path = await join(cacheDirPath);

export const match_email =  (email:string)=>{
    let match = new RegExp(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,5}\b/gi);
    if(email.match(match)) return { status: true, value: Array.from(email.match(match) || [])[0] }
    return { status: false, value: null }
}

export function sleep(arg0: number) {
    return new Promise((resolve, reject)=>{
        setTimeout(resolve,arg0)
    })
}