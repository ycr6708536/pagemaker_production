import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import immutable from 'immutable';

import './common.scss';
import './app.scss';

import Header from './header.js';
import UnitsList from './unitsList.js';
import Content from './content.js';
import Footer from './footer.js';
import Preview from './preview.js'

import unitAction from '../action/unit';
import { Modal } from 'antd';

import $ from 'jquery'

class App extends React.Component {
    handleClickMask(event){
        $('.m-units-list').css('left', '-200px');
        $('.m-preview').hide();
        $('.mask').hide();
    }
    showConfirm(address) {
        Modal.confirm({
            title: '温馨提示',
            content: 
            <div>
                <p>因为服务器会定期清理一个月前上传到服务器但是没有发布的文件，所以会导致部分文件加载不了。</p>
                <p>您可以选择返回重新上传如下文件：</p>
                <p>{address}</p>
                <p>或者，如果不需要存储配置可直接选择清空配置。</p>
            </div>,
            onOk() {unitAction.clear();},
            onCancel() {},
            okText:"清空",
            cancelText:"返回"
        });
    }
    componentWillMount() {
        let me = this;
        // 因为清理按钮会清除一个月前上传到服务器但是没有发布的文件，所以会导致图片加载不了
        // 这里做了提示，但是会导致所有文件再次加载一遍
        //检测文件类型: img / audio / video 
        function getFileType(filename) {
            var name = filename.toLowerCase();
            return /\.(?:png|gif|jpg|jpeg|svg)$/.test(name) ? "img" : /\.(?:mp3|mid|wav|wma)$/.test(name) ? "audio" : /\.(?:mp4|ogg|3gp)$/.test(name) ? "video" : 'unknown';
        }
        let localData = localStorage.getItem('config');
        if(!!localData){
            let addressArr = [];
            let formatlocalData = JSON.parse(localData);
            formatlocalData.forEach(function(item, index){
                item.address && addressArr.push(item.address);
            })
            let promises = addressArr.map(function (address) {
                return new Promise(function (resolve, reject) {
                    let type = getFileType(address);
                    if(type != 'unknown'){
                        let domType = document.createElement(type);
                        domType.onload = function() {
                            resolve(domType);
                        };
                        domType.onerror = function() {
                            reject(new Error(address));
                        };
                        domType.src = address;
                    }else{
                        if(address.indexOf('http') != -1){
                            // 因为上传做了类型限制，所以这里的unknown可能是一些线上视频地址
                            console.log('如下文件类型为unknown或者采用的线上地址\n' + address);
                        }else{
                            Modal.confirm({
                                title: '温馨提示',
                                content: 
                                <div>
                                    <p>文件地址错误，您可以选择返回重新上传如下文件：</p>
                                    <p>{address}</p>
                                    <p>或者，如果不需要存储配置可直接选择清空配置。</p>
                                </div>,
                                onOk() {unitAction.clear();},
                                onCancel() {},
                                okText:"清空",
                                cancelText:"返回"
                            });
                        }
                    }
                });
            });
            Promise.all(promises).then(function (posts) {
                // console.log('文件加载成功');
                return
            }).catch(function(reason){
                // console.log('文件加载失败');
                me.showConfirm(reason.message);
            });
        }
    }

    componentDidMount() {
        // 预览部分自适应
        var setPreviewSize = function(){
            let wHeight = window.innerHeight;
            let wWidth = window.innerWidth;
            let ratio = wWidth < 800? wHeight/800 : (wHeight - 100)/800;
            $('.m-preview').css('transform', `scale(${ratio})`);
        }
        setPreviewSize();
        if(window.innerWidth > 800){
            $(window).on('resize', function(){
                setPreviewSize();
            });
        }
        // 侧边栏背景自适应
        if((screen.width < 800) && ($('.m-units-list').height() > $('.m-units-list ul').height() + 200)){
            $('.m-units-list ul').css('height', '100%');
        }
        $('#J_aside').click(function(event) {
            $('.m-units-list').css('left', '0');
            $('.mask').show();
        });
        $('#J_preview').click(function(event) {
            $('.m-preview').show();
            $('.mask').show();
        });
        $('#app').on('touchmove',function(e) {
            if($('.m-preview').css('display') == 'block' && $('.mask').css('display') == 'block'){
                e.preventDefault();
            }
        });
    }
    render() {
        
        return (
            <div id="main">
                <Header />
                <div className="mask" onClick={this.handleClickMask}></div>
                <div className="m-body f-cb">
                    <UnitsList />
                    <Content />
                    <Preview />
                </div>
                <Footer />
            </div>
        );
    }
}

export default App
