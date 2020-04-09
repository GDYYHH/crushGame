/**
 * [layer] 修改昵称界面
 */
import { ClientNetControl } from "../../ClientNetControl"
import { UIManager } from "../../../framework/ui/UIManager";
import { BaseLayer } from "../../../framework/ui/BaseLayer"

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModifyNameLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.Button)
    btn_sure: cc.Button = null
    @property(cc.EditBox)
    eidt_name: cc.EditBox = null

    nickName: string = ""

    onLoad() {
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("ModifyNameLayer")
        })

        this.btn_sure.node.on('click', () => {
            cc.log(this.eidt_name.string, "确定修改昵称")
            if (this.eidt_name.string == null || this.eidt_name.string == '') {
                UIManager.GetInstance().showToast("昵称不能为空", 2)
                return
            } else if (this.eidt_name.maxLength > 12) {
                UIManager.GetInstance().showToast("昵称过长", 2)
                return
            }

            ClientNetControl.GetInstance().send_modifyUserInfo(this.eidt_name.string)
        })

        this.eidt_name.node.on('text-changed', () => {
            this.nickName = this.eidt_name.string
        })
    }

    public setViewBack(data: any) {
        if (data.bSuccessed && data.bSuccessed == 1) {
            UIManager.GetInstance().hide("ModifyNameLayer")
        }
    }
}
