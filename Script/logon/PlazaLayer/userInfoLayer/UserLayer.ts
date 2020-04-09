/**
 * [layer] 用户信息界面
 */
import { UIManager } from "../../../framework/ui/UIManager"
import { BaseLayer } from "../../../framework/ui/BaseLayer"
import { GlobalUser } from "../../../framework/config/GlobalUser"
import { GameDefine } from "../../../framework/config/GameDefine"
import { SocketManager } from "../../../framework/network/SocketManager"

const { ccclass, property } = cc._decorator;
@ccclass
export default class UserLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null                    // 关闭界面
    @property(cc.Button)
    btn_changeHead: cc.Button = null               // 更换头像
    @property(cc.Button)
    btn_changeName: cc.Button = null               // 修改昵称
    @property(cc.Button)
    btn_copyId: cc.Button = null                   // 复制id
    @property(cc.Button)
    btn_binding: cc.Button = null                  // 绑定手机
    @property(cc.Label)
    t_resetPassword: cc.Label = null               // 重置密码提示
    @property(cc.Button)
    btn_resetRegister: cc.Button = null            // 重置登录密码
    @property(cc.Button)
    btn_resetStrongbox: cc.Button = null           // 重置保险箱密码
    @property(cc.Button)
    btn_switchAccount: cc.Button = null            // 更换账号
    @property(cc.Label)
    t_gold: cc.Label = null                        // 金币数量
    @property(cc.Label)
    t_strongbox: cc.Label = null                   // 保险箱金钱数量
    @property(cc.Label)
    t_name: cc.Label = null                        // 昵称
    @property(cc.Label)
    t_id: cc.Label = null                          // 游戏id
    @property(cc.Label)
    t_phone: cc.Label = null                       // 手机号
    @property(cc.Label)
    t_version: cc.Label = null                     // 版本号
    @property(cc.Sprite)
    sp_head: cc.Sprite = null                      // 头像
    @property(cc.Slider)
    silder_music: cc.Slider = null                 // 音量调节
    @property(cc.Slider)
    silder_sound: cc.Slider = null                 // 音效调节
    @property(cc.ProgressBar)
    probar_music: cc.ProgressBar = null            // 音量显示条
    @property(cc.ProgressBar)
    probar_sound: cc.ProgressBar = null            // 音效显示条

    user_id: number = 0  //用户id

    onLoad() {
        this.t_name.string = GlobalUser.user_name
        this.t_id.string = "" + GlobalUser.user_gameID
        this.t_gold.string = "" + GlobalUser.user_goldScore
        this.t_strongbox.string = "" + GlobalUser.user_bankScore
        this.setUserHead()

        // 如果没有手机号, 则隐藏修改密码功能
        if (GlobalUser.user_mobile === '' || GlobalUser.user_mobile == null) {
            this.btn_binding.node.active = true
            this.t_resetPassword.node.active = false
            this.btn_resetRegister.node.active = false
            this.btn_resetStrongbox.node.active = false
            this.t_phone.string = "未绑定手机"
        } else {
            this.btn_binding.node.active = false
            this.t_resetPassword.node.active = true
            this.btn_resetRegister.node.active = true
            this.btn_resetStrongbox.node.active = true
            this.t_phone.string = "" + GlobalUser.user_mobile
        }

        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("UserLayer")
        })

        // 打开头像选择页面
        this.btn_changeHead.node.on('click', () => {
            UIManager.GetInstance().show("ModifyHeadLayer")
        })

        // 打开昵称设置页面
        this.btn_changeName.node.on('click', () => {
            UIManager.GetInstance().show("ModifyNameLayer")
        })

        this.btn_copyId.node.on('click', () => {
            if (cc.sys.isNative) {
            }
            else if (cc.sys.isBrowser) {
                let textArea: any = null
                textArea = document.getElementById("clipBoard")
                if (textArea === null) {
                    textArea = document.createElement("textarea");
                    textArea.id = "clipBoard";
                    textArea.textContent = this.user_id;
                    document.body.appendChild(textArea);
                }
                textArea.select();
                try {
                    const msg = document.execCommand('copy') ? 'successful' : 'unsuccessful';
                    cc.log("已经复制到剪贴板");
                    document.body.removeChild(textArea);
                } catch (err) {
                    cc.log("复制到剪贴板失败");
                }
            }
        })

        this.btn_binding.node.on('click', () => {
        })

        this.btn_resetRegister.node.on('click', () => {
            UIManager.GetInstance().show("VerifyLayer", 1)
        })

        this.btn_resetStrongbox.node.on('click', () => {
            UIManager.GetInstance().show("VerifyLayer", 2)
        })

        this.btn_switchAccount.node.on('click', () => {
            SocketManager.GetInstance().closeSocket(0)
            cc.director.loadScene("LogonScene")
        })

        this.silder_music.node.on('slide', () => {
            this.probar_music.progress = this.silder_music.progress
        })

        this.silder_sound.node.on('slide', () => {
            this.probar_sound.progress = this.silder_sound.progress
        })
    }
    
    public setViewBack(subID: number, data: any) {
        if (subID == GameDefine.SUB_GP_INDIVIDUAL_RESULT) {
            if (data.bSuccessed && data.bSuccessed == 1) {
                let modifyNameLayer: any = UIManager.GetInstance().getLayer("ModifyNameLayer")
                modifyNameLayer.setViewBack(data)
                this.t_name.string = modifyNameLayer.nickName
                GlobalUser.user_name = modifyNameLayer.nickName
                this._scene.refreshHeadAndName()
                UIManager.GetInstance().showToast(data.szNotifyContent || "修改成功", 2)
            } else {
                UIManager.GetInstance().showToast(data.szNotifyContent || "修改失败, 请重试", 2)
            }
        } else if (subID == GameDefine.SUB_GP_USER_FACE_INFO) {
            if (data.bSuccessed && data.bSuccessed == 1) {
                GlobalUser.user_faceID = data.wFaceID
                this.setUserHead()
                this._scene.refreshHeadAndName()

                let modifyHeadLayer: any = UIManager.GetInstance().getLayer("ModifyHeadLayer")
                modifyHeadLayer.setViewBack(data)
                UIManager.GetInstance().showToast("修改头像成功", 2)
            } else {
                UIManager.GetInstance().showToast(data.szNotifyContent || "修改失败, 请重试", 2)
            }

        }
        if (subID == GameDefine.INVALID_SEND) {
            UIManager.GetInstance().showToast(data.szNotifyContent || "修改失败, 请检查网络", 2)
        }
    }

    /**
     * 根据用户头像ID设置用户头像
     */
    public setUserHead() { 
        let path: string = 'Texture/plaza/head/img_avatar' + GlobalUser.user_faceID
        cc.loader.loadRes(path, cc.SpriteFrame, (err, spriteFrame) => {
            if (err) {
                cc.error("UserLayer Load head err: ", path)
                return
            } else {
                this.sp_head.spriteFrame = spriteFrame
            }
        })
    }
}
