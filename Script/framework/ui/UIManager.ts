/*
*   弹窗管理
*   2020/3/17
*/

import { BaseLayer } from "../ui/BaseLayer"
import { GameDefine } from "../config/GameDefine";

export class UIManager extends cc.Component {

    private _scene: any = null;
    private layerSrc = new Map<string, string>();
    private layerMap = new Map<string, BaseLayer>();

    public static ToastName = "ToastLayer";
    public static QueryDialogName = "QueryDialogLayer";

    private static Instance: UIManager = null;

    // 设计成单例模式
    private static _instance: UIManager = null
    public static GetInstance(): UIManager {
        if (this._instance == null) {
            this._instance = new UIManager()
        }
        return this._instance;
    }

    public init(scene: any, path: string) {

        this._scene = scene
        this.parsePanelSrc(path)

    }

    private parsePanelSrc(path: string) {

        let config = GameDefine.popup_src_config[path]
        for (let key in config) {
            let path = config[key];
            this.layerSrc.set(key, path);
        }

    }

    private loadUI(layerName: string, typecode?: number) {
        let path = this.layerSrc.get(layerName)

        if (path == undefined) {
            cc.error("prefab path is not found[ClientConfig.ts————>popup_src_config]")
            return
        }

        cc.loader.loadRes(path, cc.Prefab, (err, prefab) => {
            if (err) {
                cc.error("UIManager LoadLayer:", err.message)
                return
            }

            let layer = cc.instantiate(prefab);
            let baseLayer: BaseLayer = layer.getComponent(BaseLayer)
            baseLayer.init(this._scene, typecode)
            baseLayer.show()
            this.layerMap.set(layerName, baseLayer)
        })
    }

    public delete(layerName: string) {
        let baseLayer: BaseLayer = this.layerMap.get(layerName);

        if (baseLayer == undefined) {
            cc.log("baseLayer is not found")
            return
        }

        this.layerMap.delete(layerName);

    }

    public show(layerName: string, typecode?: number) {

        let baseLayer: BaseLayer = this.layerMap.get(layerName);

        if (baseLayer == undefined) {
            this.loadUI(layerName, typecode);
        } else {
            baseLayer.init(this._scene, typecode);
            baseLayer.show();

            return baseLayer
        }
    }

    public hide(layerName: string) {

        let baseLayer: BaseLayer = this.layerMap.get(layerName);

        if (baseLayer == undefined) {
            cc.log("baseLayer is not found")
            return
        }

        baseLayer.hide()
        this.delete(layerName)

    }

    /**
     * 获取指定页面
     * @string layerName 
     */
    public getLayer(layerName: string) {
        let baseLayer: BaseLayer = this.layerMap.get(layerName)
        if (baseLayer == undefined) {
            cc.log("baseLayer is not found")
            return
        }

        return baseLayer
    }

    private loadToast(text: string, delay: number, color?: cc.Color, typecode?: number) {
        let path = this.layerSrc.get(UIManager.ToastName);

        if (path == undefined) {
            cc.error("Toast path is not found[GameDefine.ts————>popup_src_config]")
            return
        }

        cc.loader.loadRes(path, cc.Prefab, (err, prefab) => {
            if (err) {
                cc.error("UIManager LoadLayer:", err.message);
                return;
            }

            let layer = cc.instantiate(prefab);
            let baseLayer: BaseLayer = layer.getComponent(BaseLayer);
            baseLayer.init(this._scene, typecode);
            baseLayer.showToast(text, delay, color);
            this.layerMap.set(UIManager.ToastName, baseLayer);
        });

    }

    public showToast(text: string, delay: number, color?: cc.Color, typecode?: number) {

        let baseLayer: BaseLayer = this.layerMap.get(UIManager.ToastName);

        if (baseLayer == undefined) {
            this.loadToast(text, delay, color, typecode);
        } else {
            baseLayer.showToast(text, delay, color);
        }

    }

    private loadQueryDialog(text: string, callback: Function, cancelShow: boolean, confirmName?: string, cancelName?: string) {

        let path = this.layerSrc.get(UIManager.QueryDialogName);

        if (path == undefined) {
            cc.error("QueryDialog path is not found[ClientConfig.ts————>popup_src_config]")
            return
        }

        cc.loader.loadRes(path, cc.Prefab, (err, prefab) => {
            if (err) {
                cc.error("UIManager LoadLayer:", err.message);
                return;
            }

            let layer = cc.instantiate(prefab);
            let baseLayer: BaseLayer = layer.getComponent(BaseLayer);
            baseLayer.init(this._scene);
            baseLayer.showQueryDialog(text, callback, cancelShow, confirmName, cancelName);
            this.layerMap.set(UIManager.QueryDialogName, baseLayer);
        });

    }

    public showQueryDialog(text: string, callback: Function, cancelShow: boolean = true, confirmName?: string, cancelName?: string) {

        let baseLayer: BaseLayer = this.layerMap.get(UIManager.QueryDialogName);

        if (baseLayer == undefined) {
            this.loadQueryDialog(text, callback, cancelShow, confirmName, cancelName);
        } else {
            baseLayer.init(this._scene);
            baseLayer.showQueryDialog(text, callback, cancelShow, confirmName, cancelName);
        }

    }
}