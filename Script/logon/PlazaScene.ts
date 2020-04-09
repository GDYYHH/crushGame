/**
 * [scene] 大厅场景
 */

import { UIManager } from "../framework/ui/UIManager"
import { ClientNetControl } from "./ClientNetControl"
import { GameDefine } from "../framework/config/GameDefine"
import { HttpManager } from "../framework/network/HttpManager"
import { ClientConfig } from "../framework/config/ClientConfig"
import { GlobalUser } from "../framework/config/GlobalUser"

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlazaScene extends cc.Component {
	@property(cc.Node)
	sp_TopBg: cc.Node = null  //顶部面板
	@property(cc.Node)
	sp_BottomBg: cc.Node = null  //底部面板
	@property(cc.Node)
	sp_GameListBg: cc.Node = null  //游戏内容
	@property(cc.Button)
	btn_RM: cc.Button = null  //热门游戏
	@property(cc.Button)
	btn_JD: cc.Button = null  //经典棋牌
	@property(cc.Button)
	btn_BR: cc.Button = null  //百人游戏
	@property(cc.Button)
	btn_JJ: cc.Button = null  //街机游戏
	@property(cc.Button)
	btn_CP: cc.Button = null  //彩票游戏
	@property(cc.Button)
	btn_game: cc.Button = null  //游戏按钮item
	@property(cc.Button)
	btn_record: cc.Button = null  //战绩
	@property(cc.Button)
	btn_agency: cc.Button = null  //全民代理
	@property(cc.Button)
	btn_task: cc.Button = null  //任务
	@property(cc.Button)
	btn_activity: cc.Button = null  //活动
	@property(cc.Button)
	btn_redPacket: cc.Button = null  //红包
	@property(cc.Button)
	btn_lottery: cc.Button = null  //幸运抽奖
	@property(cc.Button)
	btn_sign: cc.Button = null  //签到
	@property(cc.Button)
	btn_copy: cc.Button = null  //复制官网
	@property(cc.Button)
	btn_add: cc.Button = null  //充值
	@property(cc.Button)
	btn_head: cc.Button = null  //个人信息
	@property(cc.Button)
	btn_notice: cc.Button = null  //公告
	@property(cc.Button)
	btn_insurance: cc.Button = null  //保险箱
	@property(cc.Button)
	btn_service: cc.Button = null  //客服
	@property(cc.Button)
	btn_exchange: cc.Button = null  //提现
	@property(cc.Button)
	btn_rigister: cc.Button = null  //注册送金币
	@property(cc.Button)
	btn_binding: cc.Button = null  //绑定推荐人
	@property(cc.Button)
	btn_recharge: cc.Button = null  //充值
	@property(cc.Label)
	t_name: cc.Label = null  //昵称
	@property(cc.Label)
	t_id: cc.Label = null  //id
	@property(cc.Label)
	t_gold: cc.Label = null  //余额
	@property(cc.Label)
	t_url: cc.Label = null  //官网网址
	@property(cc.Sprite)
	sp_head: cc.Sprite = null  //头像
	@property(cc.Node)
	scrollView_game: cc.Node = null  //大厅游戏列表
	@property(cc.Prefab)
	per_userLayer: cc.Prefab = null  //个人信息界面

	public userInfoLayer: any = null

	public all_HRLList = []    // 所有走马灯数据
	public all_NoticeList = []    // 所有公告数据
	public all_MailList = []    // 所有邮件数据


	onLoad() {
		UIManager.GetInstance().init(this, "plaza")
		this.t_name.string = GlobalUser.user_name;
		this.t_id.string = GlobalUser.user_gameID.toString()
		this.t_gold.string = GlobalUser.user_goldScore.toString()

		this.refreshHeadAndName()
		this.requestHotGameList()
		this.requestNoticeList()
		// this.requestMailList()

		this.btn_RM.node.on('click', () => {
			cc.log("热门游戏")
			this.initGameButton(this.getCurGameList(GameDefine.HotGameList))
		})

		this.btn_JD.node.on('click', () => {
			cc.log("经典棋牌")
			this.initGameButton(this.getCurGameList(GameDefine.QPGameList))
		})

		this.btn_BR.node.on('click', () => {
			cc.log("百人游戏")
			this.initGameButton(this.getCurGameList(GameDefine.BRGameList))
		})

		this.btn_JJ.node.on('click', () => {
			cc.log("街机游戏")
			this.initGameButton(this.getCurGameList(GameDefine.JJGameList))
		})

		this.btn_CP.node.on('click', () => {
			cc.log("彩票游戏")
			this.initGameButton(this.getCurGameList(GameDefine.CPGameList))
		})

		this.btn_record.node.on('click', () => {
			cc.log("个人战绩")
			UIManager.GetInstance().showQueryDialog("显示一条自定义QueryDialog消息！", (ok) => {
				if (ok) {
					cc.log("点击了确定");
				} else {
					cc.log("点击了取消");
				}
			})
		})

		this.btn_agency.node.on('click', () => {
			cc.log("全民代理")
			UIManager.GetInstance().show("AgentLayer")
		})

		this.btn_task.node.on('click', () => {
			cc.log("每日任务")
			UIManager.GetInstance().showToast("程序员拼命研发中", 2)
		})

		// 活动
		this.btn_activity.node.on('click', () => {
			UIManager.GetInstance().show("ActivityLayer")
		})

		this.btn_redPacket.node.on('click', () => {
			cc.log("幸运红包")
			UIManager.GetInstance().showToast("程序员拼命研发中", 2)
		})

		this.btn_lottery.node.on('click', () => {
			cc.log("幸运轮盘")
			UIManager.GetInstance().showToast("程序员拼命研发中", 2)
		})

		this.btn_sign.node.on('click', () => {
			cc.log("每日签到")
			UIManager.GetInstance().show("SignInLayer")
		})

		this.btn_copy.node.on('click', () => {
			cc.log("复制官网")
		})

		this.btn_add.node.on('click', () => {
			cc.log("充值界面")
			UIManager.GetInstance().show("RechargeLayer")
		})

		// 个人信息
		this.btn_head.node.on('click', () => {
			UIManager.GetInstance().show("UserLayer")
		})

		this.btn_notice.node.on('click', () => {
			cc.log("公告邮件")
			UIManager.GetInstance().show("NoticeLayer")
			let noticeLayer = UIManager.GetInstance().getLayer("NoticeLayer")
			
		})

		this.btn_insurance.node.on('click', () => {
			cc.log("保险箱")
			UIManager.GetInstance().show("StrongboxLayer")
		})

		this.btn_service.node.on('click', () => {
			cc.log("客服")
			UIManager.GetInstance().show("ServiceLayer")
		})

		this.btn_exchange.node.on('click', () => {
			cc.log("提现")
			UIManager.GetInstance().show("ExchangeLayer")
		})

		this.btn_rigister.node.on('click', () => {
			cc.log("注册送金币")
			UIManager.GetInstance().show("RegisterLayer")
		})

		this.btn_binding.node.on('click', () => {
			cc.log("绑定推荐人")
			UIManager.GetInstance().show("BindRecommenderLayer")
		})

		this.btn_recharge.node.on('click', () => {
			cc.log("商城")
			UIManager.GetInstance().show("RechargeLayer")
		})

		// 注册socekt消息回调
		ClientNetControl.GetInstance().setViewCallBack((statusID: number, bufferData?: any) => {
			this.setViewBack(statusID, bufferData)
		})
	}

	/**
     * 改变大厅控件显示
     * @boolean active 是否显示
     */
	public changeArea(active: boolean) {
		this.sp_TopBg.active = active;
		this.sp_BottomBg.active = active;
		this.sp_GameListBg.active = active;
		if (!active) {
			this.sp_TopBg.x = -GameDefine.DESIGN_WIDTH;
			this.sp_BottomBg.x = -GameDefine.DESIGN_WIDTH;
			this.sp_GameListBg.x = -GameDefine.DESIGN_WIDTH;
		} else {
			this.sp_TopBg.runAction(cc.moveTo(0.2, 0, this.sp_TopBg.y))
			this.sp_BottomBg.runAction(cc.moveTo(0.2, 0, this.sp_BottomBg.y))
			this.sp_GameListBg.runAction(cc.moveTo(0.2, 0, this.sp_GameListBg.y))
		}
	}

    /**
     * 初始化大厅游戏列表
     * @array gameList 需要加载的游戏列表
     */
	public initGameButton(gameList: object[]) {
		this.scrollView_game.destroyAllChildren()
		let self = this
		for (let itemData of gameList) {
			let kindid: number = itemData["_KindID"]
			let dataUrl = "Texture/game/" + kindid + "/" + kindid

			cc.loader.loadRes(dataUrl, sp.SkeletonData, function (err, clip) {
				let item = cc.instantiate(self.btn_game.node)
				item.active = true
				let itemSpin = item.getComponentsInChildren(sp.Skeleton)
				itemSpin[0].skeletonData = clip
				itemSpin[0].animation = "animation"
				self.scrollView_game.addChild(item)

				item.on('click', () => {
					cc.log(itemData["_GameName"])
				})
			});
		}
	}

    /**
     * 获取当前游戏列表
     * @array gameList 游戏kindID
     */
	public getCurGameList(gameList: number[]) {
		let _gameList: object[] = []
		for (let data of ClientConfig.game_list) {
			if (this.isNumInList(data["_KindID"], gameList)) {
				_gameList.push(data)
			}
		}
		return _gameList
	}

	/**
     * 刷新大厅左上角的玩家头像和昵称
     */
	public refreshHeadAndName() {
		let path: string = 'Texture/plaza/head/img_avatar' + GlobalUser.user_faceID
        cc.loader.loadRes(path, cc.SpriteFrame, (err, spriteFrame) => {
            if (err) {
                cc.error("PlazaScene Load head err: ", path)
                return
            } else {
				this.sp_head.spriteFrame = spriteFrame
				this.sp_head.node.active = true
            }
		})
		
		this.t_name.string = GlobalUser.user_name
	}

    /**
     * 判断数组中是否有该元素
     * @number num 对比的数字
     * @array numList 对比的数组
     */
	public isNumInList(num: number, numList: number[]) {
		for (let item of numList) {
			if (item == num) {
				return true
			}
		}
		return false
	}

    /**
     * 请求热门游戏列表
     */
	public requestHotGameList() {
		let callBackHotGameList = (isSucc, hotGameList: {}) => {
			if (isSucc) {
				GameDefine.HotGameList = hotGameList["gamelist"]
			}
			else {
				cc.log("获取热门游戏列表失败")
			}

			this.initGameButton(this.getCurGameList(GameDefine.HotGameList))
		}
		HttpManager.GetInstance().sendHttp_HotGameList(callBackHotGameList)
	}

    /**
     * 请求游戏公告列表
     */
	public requestNoticeList() {
		let callBackHotGameList = (isSucc, noticeList: {}) => {
			if (isSucc) {
				this.all_HRLList = noticeList["HorseRaceLamp"]
				this.all_NoticeList = noticeList["Notice"]
				cc.log(this.all_NoticeList,"公告")
			}
			else {
				cc.log("获取游戏公告列表失败")
			}
		}
		HttpManager.GetInstance().sendHttp_NoticeList(callBackHotGameList)
	}

    /**
     * 请求游戏邮件列表
     */
	public requestMailList() {
		let callBackHotGameList = (isSucc, mailList: []) => {
			if (isSucc) {
				this.all_MailList = mailList
			}
			else {
				cc.log("获取游戏邮件列表失败")
			}
		}
		HttpManager.GetInstance().sendHttp_MailList(callBackHotGameList)
	}

	/**
     * 消息回调处理
     * @number subID 子ID
     * @any data 消息数据
     */
	public setViewBack(subID: number, data?: any) {
		cc.log("PlazaScene setViewBack subID: ", subID)
		// 修改头像, 修改昵称
		if (subID === GameDefine.SUB_GP_INDIVIDUAL_RESULT || subID === GameDefine.SUB_GP_USER_FACE_INFO) {
			let userInfoLayer: any = UIManager.GetInstance().getLayer("UserLayer")
			userInfoLayer.setViewBack(subID, data)
		}

		//     if sub == yl.SUB_GP_BASEENSURE_RESULT then 				--免费金币领取结果
		// 	self:dismissPopWait()
		// 	if true == pData.success then
		// 		local cfg = self:getApp()._serverConfig
		// 		local tbArmaturename ={"Armature/CZDZ/CZDZ.ExportJson"}
		// 		ExternalFun.addArmatureCacheAsync(tbArmaturename,function( ... )
		// 			utils.showArrivalLayer(cfg.subsistenceGold/appdf.bili)
		// 		end)
		// 		local today = os.date("%d", os.time())
		// 		cc.UserDefault:getInstance():setStringForKey("freegoldDay",today)
		// 		local _Layer = self:getChildByName("freegold")
		// 		self:removeChildByName("freegold")
		// 	else
		// 		showToast(self,pData.msg or "领取失败",2)
		// 	end
		// elseif sub == yl.SUB_MB_JACKPOTCHANGE then --奖池变动
		// 	appdf.PostCustomEvent(yl.EVENT_JACKPORT_UPDATE,pData,self)
		// elseif sub == yl.SUB_MB_RECHARGESUCCESS then --充值成功
		// 	local tbArmaturename ={"Armature/CZDZ/CZDZ.ExportJson"}
		// 	ExternalFun.addArmatureCacheAsync(tbArmaturename,function( ... )
		// 		utils.showArrivalLayer(pData.dRechargeScore)
		// 	end)

		// 	local item = {}
		//     item.idx = pData.nID
		//     item.title = pData.szTitle
		//     item.sender = pData.szSender
		//     item.content = pData.szContent
		//     item.createtime = pData.szSendTime
		// 	item.status = pData.nStatus
		// 	item.rechargeType = pData.nRechargeType

		// 	if self.m_tabSystemNotice == nil then self.m_tabSystemNotice = {} end
		// 	if self.m_tabSystemNotice.emaillist  == nil then self.m_tabSystemNotice.emaillist = {} end

		// 	table.insert(self.m_tabSystemNotice.emaillist,1, item)
		// 	self.msgRedPointSp:setVisible(true)
		// 	local _noticeLayer = self._sceneLayer:getChildByTag(yl.SCENE_GAMENOTICE)
		// 	if _noticeLayer then
		// 		_noticeLayer.Mymail_tab = self.m_tabSystemNotice.emaillist
		// 		_noticeLayer:loadMail()
		// 	end	

		// 	if pData.nRechargeType == 1 then
		// 		local _BankLayer = self._sceneLayer:getChildByTag(yl.SCENE_BANK)
		// 		if _BankLayer then
		// 			if appdf.APP_BANKRATE ~= -1 then
		// 				_BankLayer:refreshYuEBaoText()
		// 				_BankLayer:request()
		// 			else
		// 				_BankLayer:refreshCunQuText()
		// 			end
		// 		end
		// 	end

		// elseif sub == yl.SUB_MB_NOTIFYIDNEWMAIL then --新邮件提醒

		// 	local item = {}
		//     item.idx = pData.nID
		//     item.title = pData.szTitle
		//     item.sender = pData.szSender
		//     item.content = pData.szContent
		//     item.createtime = pData.szSendTime
		// 	item.status = pData.nStatus

		// 	if self.m_tabSystemNotice == nil then self.m_tabSystemNotice = {} end

		// 	table.insert(self.m_tabSystemNotice.emaillist,1, item)
		// 	self.msgRedPointSp:setVisible(true)
		// 	local _noticeLayer = self._sceneLayer:getChildByTag(yl.SCENE_GAMENOTICE)
		// 	if _noticeLayer then
		// 		_noticeLayer.Mymail_tab = self.m_tabSystemNotice.emaillist
		// 		_noticeLayer:loadMail()
		// 	end

		// elseif sub == yl.SUB_MB_RADIO_MESSAGE then	--跑马灯
		// 	if pData.game_id >= yl.cqssc and pData.game_id <= yl.yydb then
		// 		return
		// 	end
		// 	local _Layer = self._sceneLayer:getChildByTag(yl.SCENE_GAME)
		// 	if pData.game_id == yl.fruitslot then
		// 		appdf.PostCustomEvent(yl.EVENT_JACKPORT_BIGPRECE,pData,self)
		// 	end
		// 	if not tolua.isnull(self.gamebroadcast) then
		// 		if _Layer and self.gamebroadcast then
		// 			self.gamebroadcast:setGameNoticeData(pData)
		// 		end
		// 	else
		// 		self.broadcast:setGameNoticeData(pData)
		// 	end
		// elseif sub == yl.SUB_GP_USER_SAVE_RESULT or sub == yl.SUB_GP_USER_TAKE_RESULT or 
		// 	sub==yl.SUB_GP_USER_INSURE_SUCCESS or sub==yl.SUB_GP_USER_INSURE_FAILUR then --银行存取款
		// 	local _bankLayer = self._sceneLayer:getChildByTag(yl.SCENE_BANK)
		// 	if _bankLayer then
		// 		_bankLayer:onBankCallBack(sub,pData)
		// 	end
		// elseif sub == yl.SUB_GP_INDIVIDUAL_RESULT or sub == yl.SUB_GP_USER_FACE_INFO then --修改头像,修改昵称
		// 	local _userinfoLayer = self._sceneLayer:getChildByTag(yl.SCENE_USERINFO)
		// 	--print("修改了头像++++++++++++")
		// 	if _userinfoLayer then
		// 		_userinfoLayer:onChangeCallBack(sub,pData)
		// 	end
		// elseif sub == yl.SUB_GP_ADD_RECHARGE_ORDER_RESULT then	--商城充值
		// 	if pData.nResult ~= 0 then
		// 		local msg = pData.szDescribeString or "创建充值订单失败"
		// 		showToast(self, msg, 1)
		// 	else
		// 		local _shopLayer = self._sceneLayer:getChildByTag(yl.SCENE_SHOP)
		// 		if _shopLayer then
		// 			_shopLayer:payResult(pData)
		// 		end
		// 	end
		// elseif sub == yl.SUB_GP_TAKE_SCORE_BY_REBATE_RESULT then --打码量返水结果
		// 	if pData.nResult ~= 0 then
		// 		local msg = pData.szDescribeString or "领取失败"
		// 		showToast(self, msg, 1)
		// 	else
		// 		local msg = pData.szDescribeString or "领取成功"
		// 		showToast(self, msg, 1)
		// 		GlobalUserItem.lUserScore = pData.lScore
		// 		self:updateInfomation()
		// 		local _exchangeLayer = self._sceneLayer:getChildByTag(yl.SCENE_Recharge)
		// 		if _exchangeLayer then
		// 			_exchangeLayer:sendCleanCodeList()
		// 		end
		// 	end
		// elseif sub == yl.SUB_GP_TAKE_SCORE_BY_ATTENDANCE_RESULT then --签到结果
		// 	if pData.nResult ~= 0 then
		// 		local msg = pData.szDescribeString or "签到失败"
		// 		showToast(self, msg, 1)
		// 	else
		// 		GlobalUserItem.lUserScore = pData.lScore
		// 		self:updateInfomation()
		// 		local _signInLayer = self:getChildByTag(yl.SCENE_SIGNIN)
		// 		if _signInLayer then
		// 			_signInLayer:signInSuccess(pData)
		// 		end
		// 	end
		// elseif sub == yl.SUB_GP_USER_BIND_MOBILE_RESULT then --绑定手机结果
		// 	if pData.ResultCode ~= 0 then
		// 		local msg = pData.szDescribeString or "绑定手机失败"
		// 		showToast(self, msg, 1)
		// 	else
		// 		GlobalUserItem.lUserScore = pData.UserScore
		// 		GlobalUserItem.lUserInsure = pData.UserInsureScore
		// 		self:updateInfomation()

		// 		local _bindingLayer = self:getChildByTag(yl.SCENE_BINDING)
		// 		if _bindingLayer then
		// 			_bindingLayer:bindSuccess(pData)
		// 		end
		// 	end
		// elseif sub == yl.SUB_GP_USER_ADD_BANKCARD_RESULT then --绑定银行卡结果
		// 	local _exchangeLayer = self._sceneLayer:getChildByTag(yl.SCENE_Recharge)
		// 	local _bindBankCard = _exchangeLayer:getChildByTag(yl.SCENE_BINDBANKCARDS)
		// 	if _bindBankCard then
		// 		_bindBankCard:bindBankCardResult(pData)
		// 	end
		// elseif sub == yl.SUB_GP_EXCHANGESCORE_RESULT then	--兑换
		// 	local _exchangeLayer = self._sceneLayer:getChildByTag(yl.SCENE_Recharge)
		// 	if _exchangeLayer then
		// 		_exchangeLayer:onExchangeCallBack(sub,pData)
		// 	end
		// elseif sub == yl.SUB_GP_USER_QUERY_SCORE_RESULT then	--提现条件查询结果
		// 	local _exchangeLayer = self._sceneLayer:getChildByTag(yl.SCENE_Recharge)
		// 	if _exchangeLayer then
		// 		_exchangeLayer:onExchangeCallBack(sub,pData)
		// 	end

		// elseif sub == yl.SUB_MB_CUSTOMER then --客服消息推送
		// 	local _KeFuLayLayer = self._sceneLayer:getChildByTag(yl.SCENE_KEFU)
		// 	if _KeFuLayLayer then
		// 		--更新客服lishiview
		// 		_KeFuLayLayer:updataChatListview(pData)
		// 	else
		// 		local feedback_tab = {}
		// 		local feedbackStr = cc.FileUtils:getInstance():getStringFromFile(device.writablePath .."kefuFeedback.txt")
		// 		if feedbackStr and  feedbackStr ~= "" then
		// 			feedback_tab = cjson.decode(feedbackStr)
		// 		end
		// 		table.insert(feedback_tab,pData)
		// 		cc.FileUtils:getInstance():writeStringToFile(cjson.encode(feedback_tab),device.writablePath .."kefuFeedback.txt")
		// 		self.kefuRedPointSp:setVisible(true)
		// 	end
		// elseif sub == yl.SUB_MB_USERHALLSCORE then --强退桌子玩家刷新金币
		// 	local curScene = self._sceneRecord[#self._sceneRecord]
		// 	if curScene ~= yl.SCENE_GAME then
		// 		GlobalUserItem.lUserScore = pData.lUserScore
		// 		self:updateInfomation()
		// 	end
		// elseif sub == yl.SUB_GP_USER_INSURE_ENABLE_RESULT then --开通结果
		// 	GlobalUserItem.cbInsureEnabled = pData.cbInsureEnabled
		// 	local msg = ""
		// 	if pData.cbInsureEnabled ~= 1 then
		// 		msg = pData.szDescribeString or "开通失败"
		// 	else
		// 		msg = pData.szDescribeString or "银行开通成功"
		// 	end
		// 	showToast(self, msg, 1)
		// elseif sub == yl.SUB_GP_TASK_INFO then  --加载任务
		// 	local _taskLayer = self:getChildByTag(yl.SCENE_TASK)
		// 	if _taskLayer then
		// 		_taskLayer:showSelfTaskView(pData)
		// 	end	
		// elseif sub == yl.SUB_GP_TASK_RESULT then  --任务结果
		// 	local _taskLayer = self:getChildByTag(yl.SCENE_TASK)
		// 	if pData.lCurrScore and pData.lCurrScore ~= 0 then
		// 		GlobalUserItem.lUserScore = pData.lCurrScore
		// 	end
		// 	self:updateInfomation()
		// 	if _taskLayer then
		// 		_taskLayer:getGameTasks(pData)
		// 	end
		// elseif sub == yl.SUB_GP_LOTTERY_USER_INFO then --轮盘配置
		// 	local _lotteryLayer = self:getChildByTag(yl.SCENE_LOTTERY)
		// 	if _lotteryLayer then
		// 		_lotteryLayer:initDialInfo(pData)
		// 	end
		// elseif sub == yl.SUB_GP_LOTTERY_CONFIG then --奖项配置
		// 	local _lotteryLayer = self:getChildByTag(yl.SCENE_LOTTERY)
		// 	if _lotteryLayer then
		// 		_lotteryLayer:initAwardInfo(pData)
		// 	end
		// elseif sub == yl.SUB_GP_LOTTERY_RECORD then    --抽奖记录
		// 	local _lotteryLayer = self:getChildByTag(yl.SCENE_LOTTERY)
		// 	if _lotteryLayer then
		// 		_lotteryLayer:initRecordInfo(pData)
		// 	end
		// elseif sub == yl.SUB_GP_LOTTERY_RESULT then --抽奖结果
		// 	local _lotteryLayer = self:getChildByTag(yl.SCENE_LOTTERY)
		// 	if _lotteryLayer then
		// 		_lotteryLayer:onLotteryResult(pData)
		// 	end
		// elseif sub == yl.SUB_GP_TAKE_SCORE_BY_REDEEMCODE_RESULT then --兑换码兑换结果
		// 	if pData.lScore and pData.lScore ~= 0 then
		// 		GlobalUserItem.lUserScore = pData.lScore
		// 	end
		// 	self:updateInfomation()
		// 	local _CDkeyLayer = self:getChildByTag(yl.SCENE_CDKEY)
		// 	if _CDkeyLayer then
		// 		_CDkeyLayer:onExchangeResult(pData)
		// 	end
		// elseif sub == yl.SUB_GP_RED_PACKER_RESULT then       -- 领取红包结果
		// 	if pData.dwOprateID == 0 or pData.dwOprateID > 2 then
		// 		if pData.lUserScore and pData.lUserScore ~= 0 then
		// 			GlobalUserItem.lUserScore = pData.lUserScore
		// 		end
		// 		self:updateInfomation()
		// 		for k, v in pairs(self.redPacketTable) do
		// 			if v.dwRedPacketID == pData.dwRedPacketID then
		// 				table.remove(self.redPacketTable, k)
		// 			end
		// 		end
		// 		if #self.redPacketTable <= 0 then
		// 			self.redPacketBtn:getChildByName("point"):hide()
		// 		end
		// 	end
		// 	local _RedPacketLayer = self:getChildByTag(yl.SCENE_REDPACKET)
		// 	if _RedPacketLayer then
		// 		_RedPacketLayer:receiveRedPacketResult(pData)
		// 	end
		// elseif sub == yl.SUB_GP_RED_INFO then       -- 所有红包消息
		// 	if GlobalUserItem.bVistor == true then
		// 		return
		// 	end
		// 	if #pData > 0 then
		// 		self.redPacketBtn:getChildByName("point"):show()
		// 	end
		// 	self.redPacketTable = {}
		// 	for i = 1, #pData do
		// 		if pData[i] then
		// 			table.insert(self.redPacketTable, pData[i])
		// 			if pData[i].dwType == 3 then
		// 				local _RedPacketLayer = self:getChildByTag(yl.SCENE_REDPACKET)
		// 				if _RedPacketLayer then
		// 					_RedPacketLayer:initMysteryRedPacket(pData[i])
		// 				else
		// 					self:openRedPacketLayer(yl.SCENE_REDPACKET, {pData[i]})
		// 					-- self:getChildByTag(yl.SCENE_REDPACKET):initMysteryRedPacket(pData[i])
		// 				end
		// 			end	
		// 		end
		// 	end

		// elseif sub == yl.SUB_MB_REDPACKETNOTICE then       -- 收到红包
		// 	if GlobalUserItem.bVistor == true then
		// 		return
		// 	end
		// 	self.redPacketBtn:getChildByName("point"):show()
		// 	table.insert(self.redPacketTable, pData)
		// 	if GlobalUserItem.bEnterGame then
		// 		return
		// 	end
		// 	if pData.dwType == 3 then
		// 		local _RedPacketLayer = self:getChildByTag(yl.SCENE_REDPACKET)
		// 		if _RedPacketLayer then
		// 			_RedPacketLayer:initMysteryRedPacket(pData)
		// 		else
		// 			self:openRedPacketLayer(yl.SCENE_REDPACKET, {pData})
		// 			-- self:getChildByTag(yl.SCENE_REDPACKET):initMysteryRedPacket(pData)
		// 		end
		// 		return
		// 	end	

		// 	local _RedPacketLayer = self:getChildByTag(yl.SCENE_REDPACKET)
		// 	if _RedPacketLayer then
		// 		_RedPacketLayer:addRedPacket(pData)
		// 	end
		// elseif sub == yl.SUB_GP_RED_RECORD_RESULT then       -- 红包记录
		// 	local _RedPacketLayer = self:getChildByTag(yl.SCENE_REDPACKET)
		// 	if _RedPacketLayer then
		// 		_RedPacketLayer:initRecord(pData)
		// 	end
		// end

		// if sub == yl.CONNECT_FAIL then  --发送失败
		// 	showToast(self,"连接服务器失败",2,cc.c4b(250,0,0,255))
		// end
		// if sub == yl.INVALID_SEND then --失败
		// 	showToast(self,"网络出错,请重试",1)
		// end

		// if sub == yl.SUB_MB_SYSTEMUPDATE then -- 全局在线通知
		// 	local popnode = ExternalFun.loadCSB("plaza/poplayer.csb", self)
		// 	local imgbg = popnode:getChildByName("Image_bg")
		// 	ExternalFun.FixScaleUI(imgbg, true)
		// 	imgbg:getChildByName("Text_1"):setString(pData.szContent)
		// 	imgbg:getChildByName("closebt"):addTouchEventListener(function(ref,type)
		// 		if type == ccui.TouchEventType.ended then
		// 			popnode:removeFromParent()
		// 		end
		// 	end)
		// end

		// if sub == yl.SUB_MB_OTHERLOGIN then -- 别处登录通知
		// 	-- 是否正在游戏中
		// 	if self:getEnterGameInfo() then
		// 		if nil ~= self._gameFrame then
		// 			print("关闭子游戏的socket连接")
		// 			self._gameFrame:onCloseSocket()
		// 		end
		// 	end

		// 	local queryLayer = QueryExit:create(pData.szContent, function (bReTry)
		// 		if bReTry == true then
		// 			if nil ~= self._gameFrame then
		// 				if not tolua.isnull(self._gameFrame._viewFrame) then
		// 					self._gameFrame._viewFrame:removeFromParent()
		// 				end
		// 				self._gameFrame = nil
		// 			end
		// 			cc.Director:getInstance():endToLua()
		// 		end
		// 	end)

		// 	queryLayer:setCanTouchOutside(false)
		// 	queryLayer:setCloseBtnside()
		// 	queryLayer:addTo(self)
		// end

		// -- 接收系统跑马灯消息
		// if sub == yl.SUB_MB_SYSTEM_RADIO_MESSAGE then 
		// 	self:receiveRadioMessage(pData)
		// end

		// if sub == yl.SUB_GP_OPERATE_FAILURE then -- 操作失败
		// 	if pData.szDescribeString then
		// 		showToast(self,pData.szDescribeString, 2)
		// 		local _lotteryLayer = self:getChildByTag(yl.SCENE_LOTTERY)
		// 		if _lotteryLayer then
		// 			_lotteryLayer:onLotteryResult(pData)
		// 		end
		// 	end
		// end
	}
}
