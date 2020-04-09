/**
 * [framework] buffer管理类
 * - [注意] 创建消息体的方法和Lua一样, 如果已知大小, 直接使用create方法, 传入大小,
 *          未知大小, 使用create_netdata方法创建
 * - [注意] 取消了Lua的setcmdinfo方法, 现在在创建消息体的时候, 直接传入主ID和子ID
 * 
 * 网络包头
 * @number dataKind    数据类型
 * @number checkCode   校验字段
 * @number packetSize  数据大小
 * @number operator    运营商编号
 * @number channel     渠道编号
 * @number mainCmdID   主命令码
 * @number subCmdID    子命令码
 */

/**
 * 数据类型枚举
 * @number DK_MAPPED    映射类型
 * @number DK_ENCRYPT   加密类型
 * @number DK_COMPRESS  压缩类型
 */
enum DataKind {
    DK_MAPPED = 0x01,
    DK_ENCRYPT = 0x02,
    DK_COMPRESS = 0x04,
}

export class BufManager {
    public send_bufferDataView: any                    // 发送ArrayBuffer数据的DataView
    public send_currByteIndex: number = 0              // 发送ArrayBuffer数据的当前游标
    public send_bufferLength: number = 0               // 发送的数据大小(除网络包头大小)
    public receive_bufferDataView: any                 // 接收ArrayBuffer数据的DataView
    public receive_currByteIndex: number = 0           // 接收ArrayBuffer数据的当前游标
    public receive_bufferLength: number = 0            // 接收的数据大小(除网络包头大小)

    /**
     * 创建字节流, 用于发送消息
     * @number length   字节长度
     * @number mainCode 主ID
     * @number subCode  子ID
     */
    public create(length: number, mainCode: number, subCode: number) {
        let headLengt: number = 12
        this.send_bufferLength = length + headLengt
        let bufferData = new ArrayBuffer(this.send_bufferLength)
        this.send_bufferDataView = new DataView(bufferData)

        // 数据类型
        this.pushByte(DataKind.DK_MAPPED)
        // 校验字段
        this.pushByte(DataKind.DK_MAPPED)
        // 数据大小
        this.pushWord(bufferData.byteLength)

        // 运营商和渠道号
        this.pushWord(1)
        this.pushWord(60)

        // 主ID和子ID
        this.pushWord(mainCode)
        this.pushWord(subCode)
    }

    /**
     * 创建网络消息包
     * @any netArray 消息体接口
     * @number mainCode 主ID
     * @number subCode  子ID
     */
    public create_netdata(netArray: any, mainCode: number, subCode: number){
        let len: number = 0

        for(let i: number = 0; i < netArray.length; i++){
            let keys: any = netArray[i]
            let keyType: string = keys['t'].toLowerCase()
    
            // 数组长度计算
            let keyLen: number = 0
            if ('byte' == keyType || 'bool' == keyType){
                keyLen = 1
            }else if ('score' == keyType || 'double' == keyType){
                keyLen = 8
            }else if ('word' == keyType  || 'short' == keyType){
                keyLen = 2
            }else if ('dword' == keyType || 'int' == keyType || 'float' == keyType){
                keyLen = 4
            }else if ('string' == keyType){
                keyLen = keys['s']
            }else if ('tchar' == keyType){
                keyLen = keys['s'] * 2
            }else if ('ptr' == keyType){
                keyLen = keys['s']
            }else {
                cc.log('error keytype==>' + keyType)
            }

            len = len + keyLen
        }

        cc.log('<== net len ==> ' + len)
        this.create(len, mainCode, subCode)
    }

    /**
     * 填充byte类型
     * @number datatype 数据
     */
    public pushByte(datatype: number){
        this.send_bufferDataView.setInt8(this.send_currByteIndex, datatype)
        this.send_currByteIndex += 1
    }

    /**
     * 填充word类型
     * @number datatype 数据
     */
    public pushWord(datatype: number){
        this.send_bufferDataView.setUint16(this.send_currByteIndex, datatype, true)
        this.send_currByteIndex += 2
    }

    /**
     * 填充dword类型
     * @number datatype 数据
     */
    public pushDword(datatype: number){
        this.send_bufferDataView.setUint32(this.send_currByteIndex, datatype, true)
        this.send_currByteIndex += 4
    }

    /**
     * 填充string类型
     * @string datatype 数据
     * @number strLen   字节长度
     */
    public pushString(datatype: string, strLen: number){
        for (let i: number = 0; i < strLen; i++) {
            let charCode = datatype.charCodeAt(i)
            this.send_bufferDataView.setInt16(this.send_currByteIndex, charCode, true)
            this.send_currByteIndex += 2
        }
    }

    /** 结构体描述
     * {k = "key", t = "type", s = len, l = {}}
     * k 表示字段名,对应C++结构体变量名
     * t 表示字段类型,对应C++结构体变量类型
     * s 针对string变量特有,描述长度
     * l 针对数组特有,描述数组长度,以table形式,一维数组表示为{N},N表示数组长度,多维数组表示为{N,N},N表示数组长度
     * d 针对table类型,即该字段为一个table类型,d表示该字段需要读取的table数据
     * ptr 针对数组,此时s必须为实际长度
     * 
     * egg
     * 取数据的时候,针对一维数组,假如有字段描述为 {k = "a", t = "byte", l = {3}}
     * 则表示为 变量a为一个byte型数组,长度为3
     * 取第一个值的方式为 a[1][1],第二个值a[1][2],依此类推
     * 
     * 取数据的时候,针对二维数组,假如有字段描述为 {k = "a", t = "byte", l = {3,3}}
     * 则表示为 变量a为一个byte型二维数组,长度都为3
     * 则取第一个数组的第一个数据的方式为 a[1][1], 取第二个数组的第一个数据的方式为 a[2][1]
     */

    /**
     * 读取网络消息
     * @any cmdArray CMD结构体
     */
    public read_netdata(cmdArray: any) {
        let cmd_table = {}
        this.receive_currByteIndex = 12

        cmdArray.forEach((keys: object) => {

            // 键名
            let key = keys['k']
            // 长度
            let keyLen = keys['l']
            // 类型
            let keyType = keys['t'].toLowerCase()
            // 处理函数
            let keyFun = null

            if ('byte' === keyType){
                keyFun = () => {
                    return this.getByte()
                }
            }else if ('int' === keyType){
                keyFun = () => {
                    return this.getInt()
                }
            }else if ('word' === keyType){
                keyFun = () => {
                    return this.getWord()
                }
            }else if ('dword' === keyType){
                keyFun = () => {
                    return this.getDword()
                }
            }else if ('score' === keyType){
                keyFun = () => {
                    return this.getScore()
                }
            }else if ('tchar' === keyType){
                if (null != keys['s'] || undefined != keys['s']){
                    keyFun = () => {
                        return this.getString(keys['s'])
                    }
                } else {
                    keyFun = () => {
                        return this.getString()
                    }
                }
            }else if ('bool' === keyType){
                keyFun = () => {
                    return this.getBool()
                }
            }else if ('table' === keyType){
                let keyObject: object = keys['d']
                let lenArray: number[] = keyLen
                let keyName: string = key
                cmd_table[key] = this.readTableHelper(keyObject, lenArray, keyName)
            }else if ('double' === keyType){
                keyFun = () => {
                    return this.getDouble()
                }
            }else if ('float' === keyType){
                keyFun = () => {
                    return this.getFloat()
                }
            }else if ('short' === keyType){
                keyFun = () => {
                    return this.getShort()
                }
            }else {
                cc.error('read_netdata error: key==>' + key + '; type==>' + keyType)
            }

            if (null != keyFun){
                let lenArray: number[] = keyLen
                cmd_table[key] = this.read_datahelper(keyFun, lenArray)
            }
        })

        return cmd_table
    }

    /**
     * 读取tablel类型数据
     */
    public readTableHelper(keyObject: object, lenArray: number[], keyName: string){
        let templateObj = keyObject || {}
        let strkey: string = keyName || 'default'
        if (null != lenArray || undefined != lenArray){
            let templateLenArr: number[] = lenArray

            let tmpArr: object = {}
            for (let i: number = 0; i < templateLenArr.length; i++){
                let entryLen = templateLenArr[i]

                let entryArray = {}
                for (let i: number = 0; i < entryLen; i++){
                    let entry = this.read_netdata(templateObj)
                    // table.insert(entryArray, entry)
                }

                // table.insert(tmpArr, entryArray)
            }

            return tmpArr
        }else {
            return this.read_netdata(templateObj)
        }
    }

    /**
     * 解析数据为可js数据
     */
    public read_datahelper(keyfunc: Function, lenArray?: number[]){
        if (null != lenArray || undefined != lenArray){
            let templateLenArr: number[] = lenArray
            let tempLateArr: object[] = []
            for (let i:number = 1; i < templateLenArr.length; i++){
                let entryLen = templateLenArr[i]

                let entryArray: object[] = []
                for (let i: number = 0; i < entryLen; i++){
                    let entry: any = keyfunc()
                    entryArray.push(entry)
                }
                tempLateArr.push(entryArray)
            }

            return tempLateArr
        }else {
            return keyfunc()
        }
    }

    /**
     * 获取byte类型
     */
    public getByte(){
        let data: any = this.receive_bufferDataView.getInt8(this.receive_currByteIndex)
        this.receive_currByteIndex += 1

        return data
    }

    /**
     * 获取int类型
     */
    public getInt(){
        let data: any = this.receive_bufferDataView.getInt32(this.receive_currByteIndex, true)
        this.receive_currByteIndex += 4

        return data
    }

    /**
     * 获取word类型
     */
    public getWord(){
        let data: any = this.receive_bufferDataView.getUint16(this.receive_currByteIndex, true)
        this.receive_currByteIndex += 2

        return data
    }

    /**
     * 获取dword类型
     */
    public getDword(){
        let data: any = this.receive_bufferDataView.getUint32(this.receive_currByteIndex, true)
        this.receive_currByteIndex += 4

        return data
    }

    /**
     * 获取score类型
     */
    public getScore(){
        let data: any = this.receive_bufferDataView.getFloat64(this.receive_currByteIndex, true)
        this.receive_currByteIndex += 8

        return data
    }

    /**
     * 获取bool类型
     */
    public getBool(){
        let data: any = this.receive_bufferDataView.getInt8(this.receive_currByteIndex)
        this.receive_currByteIndex += 1

        return data
    }

    /**
     * 获取double类型
     */
    public getDouble(){
        let data: any = this.receive_bufferDataView.getFloat64(this.receive_currByteIndex, true)
        this.receive_currByteIndex += 8

        return data
    }

    /**
     * 获取float类型
     */
    public getFloat(){
        let data: any = this.receive_bufferDataView.getInt32(this.receive_currByteIndex, true)
        this.receive_currByteIndex += 4

        return data
    }

    /**
     * 获取short类型
     */
    public getShort(){
        let data: any = this.receive_bufferDataView.getInt16(this.receive_currByteIndex, true)
        this.receive_currByteIndex += 2

        return data
    }

    /**
     * 获取string类型
     * @number ? strLen 字符串长度(不传则解析单个字符)
     */
    public getString(strLen?: number){
        if (strLen != null || strLen != undefined){
            let str: string = ''
            for (let i: number = 0; i < strLen; i++){
                let decryptStr: number = this.receive_bufferDataView.getInt16(this.receive_currByteIndex, true)
                if (decryptStr != 0){
                    str += String.fromCharCode(decryptStr)
                }

                this.receive_currByteIndex += 2
            }

            return str
        }else {
            let str: string = ''
            do {
                let decryptStr: number =this.receive_bufferDataView.getInt16(this.receive_currByteIndex, true)
                if (decryptStr != 0){
                    str += String.fromCharCode(decryptStr)
                }

                this.receive_currByteIndex += 2
            }while(this.receive_bufferDataView.getInt16(this.receive_currByteIndex, true))

            return str
        }
    }

    /**
     * 设置当前接收数据的游标值
     */
    public setCurrByteIndex (index: number) {
        this.receive_currByteIndex = index || 12
    }

/*******************************************************    加密解密     **************************************************************** */

    // 加密密钥
    public PacketKey: number = 0xB78A4E2B

    // 发送映射
    public SendByteMap: number[] = [
        0xD7,0x3A,0x99,0x19,0x31,0xD0,0x84,0x9A,0xDC,0x78,0xAF,0x5A,0x17,0x92,0x3C,0x5D,
        0x51,0x62,0x95,0x33,0xAB,0x81,0x5C,0x64,0x75,0xF6,0xC3,0x1F,0xB3,0x2F,0x88,0xC5,
        0x22,0xFD,0x02,0xE0,0x74,0x05,0xAE,0x60,0xD9,0xCF,0xFF,0xAA,0xA4,0xB2,0xC6,0x3F,
        0x65,0x35,0x2B,0x85,0x9B,0xD2,0x55,0x3B,0x2A,0xA5,0xC9,0x4F,0x21,0x0E,0xF5,0x7E,
        0x0C,0x58,0xE5,0x8F,0x83,0xCA,0x10,0xA0,0xB6,0x56,0x40,0xD1,0x54,0x04,0x79,0xB9,
        0x8E,0x07,0xA2,0xE9,0x3D,0x77,0x15,0xBB,0x8C,0xEF,0xC2,0x97,0xDD,0x86,0x4C,0x8D,
        0xF7,0x63,0x57,0x1D,0xE1,0x1B,0x8A,0xD6,0xA7,0xF9,0x12,0x87,0x06,0x8B,0x6E,0x4A,
        0x93,0xB5,0x30,0x2E,0x90,0x32,0x00,0x29,0xF4,0x39,0x9D,0xD4,0xF0,0x50,0x98,0x66,
        0x43,0xDF,0x08,0x1A,0x42,0x03,0x01,0x7D,0x6A,0x68,0x73,0x38,0xBD,0xF1,0xB4,0x24,
        0x2C,0x7C,0xAD,0x82,0xC8,0x26,0xFB,0x5E,0x5B,0x23,0x25,0xEB,0xEE,0x0D,0x9C,0x5F,
        0x34,0x52,0x0A,0xC1,0xD8,0x41,0x13,0x6F,0x72,0x28,0x4B,0xE3,0xC0,0xA8,0x0B,0x3E,
        0xBF,0x48,0x6D,0xB0,0xFE,0x47,0x44,0x76,0xBA,0x18,0x71,0x11,0xB7,0xD5,0xBC,0x0F,
        0x53,0x69,0x89,0xE7,0xE6,0xAC,0xCB,0xB8,0xB1,0x6C,0x37,0xF8,0x80,0xC7,0x96,0xA6,
        0xED,0x36,0xFA,0x46,0xCD,0xEC,0xA1,0x4E,0x7A,0x27,0x7F,0xCC,0xDE,0xDA,0x20,0xFC,
        0x61,0x45,0x1E,0x67,0x4D,0x9E,0x70,0xDB,0xE2,0xEA,0x2D,0x94,0x7B,0xBE,0xE8,0xCE,
        0xD3,0x9F,0x91,0x59,0x09,0xC4,0x6B,0x16,0x1C,0xF3,0xF2,0xE4,0xA3,0x14,0x49,0xA9
    ]

    // 接收映射
    public RecvByteMap: number[] = [
        0x76,0x86,0x22,0x85,0x4D,0x25,0x6C,0x51,0x82,0xF4,0xA2,0xAE,0x40,0x9D,0x3D,0xBF,
        0x46,0xBB,0x6A,0xA6,0xFD,0x56,0xF7,0x0C,0xB9,0x03,0x83,0x65,0xF8,0x63,0xE2,0x1B,
        0xDE,0x3C,0x20,0x99,0x8F,0x9A,0x95,0xD9,0xA9,0x77,0x38,0x32,0x90,0xEA,0x73,0x1D,
        0x72,0x04,0x75,0x13,0xA0,0x31,0xD1,0xCA,0x8B,0x79,0x01,0x37,0x0E,0x54,0xAF,0x2F,
        0x4A,0xA5,0x84,0x80,0xB6,0xE1,0xD3,0xB5,0xB1,0xFE,0x6F,0xAA,0x5E,0xE4,0xD7,0x3B,
        0x7D,0x10,0xA1,0xC0,0x4C,0x36,0x49,0x62,0x41,0xF3,0x0B,0x98,0x16,0x0F,0x97,0x9F,
        0x27,0xE0,0x11,0x61,0x17,0x30,0x7F,0xE3,0x89,0xC1,0x88,0xF6,0xC9,0xB2,0x6E,0xA7,
        0xE6,0xBA,0xA8,0x8A,0x24,0x18,0xB7,0x55,0x09,0x4E,0xD8,0xEC,0x91,0x87,0x3F,0xDA,
        0xCC,0x15,0x93,0x44,0x06,0x33,0x5D,0x6B,0x1E,0xC2,0x66,0x6D,0x58,0x5F,0x50,0x43,
        0x74,0xF2,0x0D,0x70,0xEB,0x12,0xCE,0x5B,0x7E,0x02,0x07,0x34,0x9E,0x7A,0xE5,0xF1,
        0x47,0xD6,0x52,0xFC,0x2C,0x39,0xCF,0x68,0xAD,0xFF,0x2B,0x14,0xC5,0x92,0x26,0x0A,
        0xB3,0xC8,0x2D,0x1C,0x8E,0x71,0x48,0xBC,0xC7,0x4F,0xB8,0x57,0xBE,0x8C,0xED,0xB0,
        0xAC,0xA3,0x5A,0x1A,0xF5,0x1F,0x2E,0xCD,0x94,0x3A,0x45,0xC6,0xDB,0xD4,0xEF,0x29,
        0x05,0x4B,0x35,0xF0,0x7B,0xBD,0x67,0x00,0xA4,0x28,0xDD,0xE7,0x08,0x5C,0xDC,0x81,
        0x23,0x64,0xE8,0xAB,0xFB,0x42,0xC4,0xC3,0xEE,0x53,0xE9,0x9B,0xD5,0xD0,0x9C,0x59,
        0x7C,0x8D,0xFA,0xF9,0x78,0x3E,0x19,0x60,0xCB,0x69,0xD2,0x96,0xDF,0x21,0xB4,0x2A
    ]

    /**
     * 加密buffer数据
     */
    public encryptBuffer() {
        let encryptData: number
        let currByte: number
        let currIndex: number = 8
        let nCheckCode: number = 0
        let dataBufferSize = this.send_bufferLength - currIndex

        if (dataBufferSize > 0){
            nCheckCode = 0
            do {
                currByte = this.send_bufferDataView.getUint8(currIndex)
                encryptData = this.SendByteMap[currByte]
                encryptData = encryptData^this.PacketKey
                encryptData = encryptData^1
                this.send_bufferDataView.setInt8(currIndex, encryptData)

                nCheckCode = (currByte + nCheckCode) % 256
                ++currIndex
                --dataBufferSize
            } while (dataBufferSize)
        }

        let cbDataKind = this.send_bufferDataView.getInt8(0)
        cbDataKind|DataKind.DK_MAPPED
        this.send_bufferDataView.setInt8(0, cbDataKind)

        let cbCheckCode = this.send_bufferDataView.getInt8(1)
        this.send_bufferDataView.setInt8(1, -cbCheckCode)

        return nCheckCode
    }

    /**
     * 解密buffer数据
     * @ArrayBuffer bufferData ArrayBuffer数据
     * @returns 返回一个列表, 包含主ID和子ID
     */
    public decryptBuffer(bufferData: ArrayBuffer): number[] {
        this.receive_bufferLength = bufferData.byteLength
        this.receive_bufferDataView = new DataView(bufferData)

        let decryptData: number
        let currIndex: number = 8
        let dataBufferSize = this.receive_bufferLength - currIndex

        if (dataBufferSize > 0){
            do {
                decryptData = this.receive_bufferDataView.getUint8(currIndex)
                let a: number = decryptData^this.PacketKey
                let c: number = a>>>0
                let b: number = c&0xff
                let d: number = b^this.receive_bufferDataView.getUint16(4, true)
                decryptData = this.RecvByteMap[d]
                this.receive_bufferDataView.setInt8(currIndex, decryptData)
                ++currIndex
                --dataBufferSize
            } while (dataBufferSize)
        }

        let mainID: number = this.receive_bufferDataView.getUint16(8, true)
        let subID: number = this.receive_bufferDataView.getUint16(10, true)
        let code: number[] = [mainID, subID]
        return code
    }
}