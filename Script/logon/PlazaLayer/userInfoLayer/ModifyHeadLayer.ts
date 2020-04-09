/**
 * [layer] 修改头像界面
 */
import { ClientNetControl } from "../../ClientNetControl"
import { UIManager } from "../../../framework/ui/UIManager"
import { BaseLayer } from "../../../framework/ui/BaseLayer"
import { GlobalUser } from "../../../framework/config/GlobalUser";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModifyHeadLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.Button)
    btn_sure: cc.Button = null
    @property(cc.Toggle)
    btn_head: cc.Toggle[] = []

    private _currentIndex: number = GlobalUser.user_faceID

    onLoad() {
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("ModifyHeadLayer")
        })

        for (let index = 0; index < this.btn_head.length; index++) {
            this.btn_head[index].node.on('click', () => {
                this._currentIndex = index
            })
        }

        this.btn_head[this._currentIndex].isChecked = true
        this.btn_sure.node.on('click', () => {
            ClientNetControl.GetInstance().send_modifySystemHead(this._currentIndex)
        })
    }

    public setViewBack(data: any) {
        if (data.bSuccessed && data.bSuccessed == 1) {
            UIManager.GetInstance().hide("ModifyHeadLayer")
        }
    }
}
