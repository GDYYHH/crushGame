/**
 * [framework] 多平台管理
 */

const {ccclass, property} = cc._decorator

@ccclass
export class PlatformManager extends cc.Component {
    // 设计成单例模式
    private static _instance: PlatformManager = null
    public static GetInstance(): PlatformManager {
        if (this._instance == null) {
            this._instance = new PlatformManager()
        }
        return this._instance;
    }

    /**
     * 获取设备类型
     */
    public getDeviceTypeID() {
        return cc.sys.os
    }

    /**
     * 获取窗口分辨率
     */
    public getWinSize() {
        return cc.sys.windowPixelResolution
    }

    /**
     * 获取客户端IP
     */
    public getClientIP() {
        // let xhr = new XMLHttpRequest();
        // xhr.responseType = 'text';
        // xhr.onerror = () => { cc.error("HttpManager: request onabort") }
        // xhr.onabort = () => { cc.warn("HttpManager: request onerror") }
        // xhr.ontimeout = () => { cc.warn("HttpManager: request ontimeout") }
        // xhr.onreadystatechange = () => {
        //     cc.log(`HttpManager onReadyStateChange readyState=${xhr.readyState}, status=${xhr.status}`)
        //     cc.log(xhr.responseText.match(/(?<="cip": ")[0-9.]+/)[0])
        //     if(xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
        //         cc.log(xhr)
        //         }
        //         else {
        //             throw new Error("HttpManager: HttpData is null")
        //         }
        //     }
            
        // xhr.open('GET', 'http://pv.sohu.com/cityjson?ie=utf-8', true)
        // xhr.send()
    }
}