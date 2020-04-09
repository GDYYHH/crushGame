import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer";

/**
 * [layer] 签到界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class QueryDialogLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.Button)
    btn_confirm: cc.Button = null
    @property(cc.Button)
    btn_cancel: cc.Button = null
    @property(cc.Label)
    t_desc: cc.Label = null
    @property(cc.Label)
    t_confirm: cc.Label = null
    @property(cc.Label)
    t_cancel: cc.Label = null

    private _callback: Function = null;

    onLoad() {
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide(UIManager.QueryDialogName)
        })
        this.btn_confirm.node.on('click', () => {
            this._callback(true);
            UIManager.GetInstance().hide(UIManager.QueryDialogName)
        })
        this.btn_cancel.node.on('click', () => {
            this._callback(false);
            UIManager.GetInstance().hide(UIManager.QueryDialogName)
        })
    }

    //重载
    public showQueryDialog(text: string, callback: Function, cancelShow: boolean, confirmName?: string, cancelName?: string) {
        this._callback = callback;
        this.t_desc.string = text;
        this.btn_cancel.node.active = cancelShow;
        if (confirmName) {
            this.t_confirm.string = confirmName;
        }
        if (cancelName) {
            this.t_cancel.string = cancelName;
        }

        let action = cc.scaleTo(0.5, 1, 1).easing(cc.easeElasticOut(0.5))
        this.node_layer.runAction(action)
    }
}
