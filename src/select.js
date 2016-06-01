/**
 * 16-04-22 bug修复，在一个页面多个实例化时会出现下拉选择时赋值混乱，
 * bug原因在于每一个select,ui-select都是独立私有化的，而唯一dropdown是公用的，公有与私有混在一起就会发生混乱
 */
define(function(require,exports,module){
    var $ = require('$');
    var select = function( options ){
        if( typeof options === 'string' || (options instanceof jQuery) || options.nodeName ){
            options = {trigger:options};
        }
        this.options = options;
        
        if( typeof this.options.trigger==='undefined' ){
            throw new TypeError('select trigger is undefined');
        }
        
        this.options.trigger = $( this.options.trigger );
        typeof this.options.infiniteWidth === 'undefined' && ( this.options.infiniteWidth=false );
        typeof this.options.readonly === 'undefined' && ( this.options.readonly=true );
        this.init();
        return this.options.trigger;
    }
    select.prototype = {
        constructor: select,
        curNode: null,
        eleInit: function(){
            var This = this,
            
            bindEvt = function( ui_select ){
                ui_select.on(This.options.eventType||'click', function(){
                    var $this = $(this);
                    if( $this.hasClass('disabled') )return;
                    
                    var originSelect = this.select,
                    key   = $this.find('.civalue').val(),
                    ohtml = '';
                    
                    originSelect.children().each(function(i,ele){
                        ele = $(ele);
                        if( ele.prop('nodeName')==='OPTGROUP' ){
                            ohtml += '<div class="optgroup"><label>'+ele.attr('label')+'</label>';
                            ele.children().each(function(){
                                var $this = $( this );
                                ohtml += '<a href="javascript:;" value="'+$this.val()+'" title="'+$this.text()+'" '+($this.is(':selected')?'class="active"':'')+'>'+$this.text()+'</a>';
                            })
                            ohtml += '</div>';
                        }else{
                            ohtml += '<a href="javascript:;" value="'+ele.val()+'" title="'+ele.text()+'" '+(ele.is(':selected')?'class="active"':'')+'>'+ele.text()+'</a>';
                        }
                    })
                    
                    This.options.trigger.next('.ui-select').removeClass('ui-select-focus');
                    This.curNode = $this.addClass('ui-select-focus');
                    
                    // 防止混乱
                    This.dropbox.data('curNode', This.curNode);
                    //ohtml = ohtml.replace(/<option/img,'<a href="javascript:;"').replace(/option>/img,'a>');
                    This.dropbox.html(ohtml).css({width:This.options.infiniteWidth===false?$this.outerWidth(true):undefined,'min-width':$this.outerWidth(true),left:$this.offset().left,top:$this.offset().top+ui_select.outerHeight(true)+~~This.options.top});
                    ohtml && This.dropbox.slideDown('fast');
                    //var selected = This.dropbox.find('[value="'+key+'"]');
                    //selected = selected.length ? selected : This.dropbox.find( 'a:contains("'+key+'")' );
                    //selected.addClass('active');
                    
                    typeof This.options.open === 'function' && This.options.open.apply($this, [This.dropbox]);
                    
                })
                .on('mousedown', function( ev ){
                    
                    ev.stopPropagation();
                    
                })
            }
            
            if( this.options.trigger.prop('nodeName')==='SELECT' ){
                
                this.dropbox = $('#ui-selectdrop').length ? $('#ui-selectdrop') : $('<div/>', {id:'ui-selectdrop',style:'position:absolute',class:'dropDownContent'}).appendTo('body');
                this.options.trigger.each(function(i,ele){
                    ele = $(ele);
                    var name = ele.attr('ui-name'),
                    isDisabled = ele.is(':disabled'),
                    width    = ele.css('width') ? ele.css('width') : (getComputedStyle(ele)['width']||'132px'),
                    unit     = width.match(/(\d+)(\w+|%)/),
                    ui_select= $('<span class="ui-select'+(isDisabled?' disabled':'')+'" style="width:'+(~~unit[1]<=22?132:unit[1])+unit[2]+'"><input class="ciname" type="text"'+(This.options.readonly===true||isDisabled?' readonly="readonly" onfocus="blur()"':'')+' value="'+ele.find(':selected').text()+'" title="'+ele.find(':selected').text()+'" style="width:'+((~~unit[1]<=22?132:unit[1])-22)+unit[2]+'"><input value="civalue" type="hidden"'+(name?' name="'+name+'"':'')+' value="'+ele.val()+'"><i></i></span>');
                    typeof This.options.render === 'function' && This.options.render.call( ele, ui_select );
                    ele.hide().after( ui_select );
                    ele[0]['ui-select'] = ui_select;
                    ele[0].set_uival = function(){
                        
                        var $this = $( this );
                        this['ui-select'].find('.ciname').val( $this.find(':selected').text() ).end().find('.civalue').val( $this.val() );
                    
                    }
                    ui_select[0]['select'] = ele;
                    
                    bindEvt( ui_select );
                    
                })
                // 提供一个自定方法是让select选择值后调用此方法将值赋值到ui-select
                .on('set_uival', function(){
                    
                    this.set_uival();
                    
                })
                this.evt();
                
            }
        },
        evt: function( ui_select ){
            
            var This = this;
            this.dropbox.off('click','a').on('click', 'a', function(){
                
                var $this = $( this ), dropbox = $this.parent(), curNode = dropbox.data('curNode');
                $this.addClass('active').siblings('a').removeClass('active');
                curNode.removeClass('ui-select-focus').find('.ciname').val( $this.text() ).attr( 'title', $this.text() ).end().find('.civalue').val( $this.attr('value')||$this.text() );
                curNode[0]['select'].val( $this.attr('value')||$this.text() ).trigger('change');
                dropbox.slideUp('fast');
                
                typeof This.options.change === 'function'&&This.options.change.apply(dropbox, [curNode[0]['select'],curNode,$this.attr('value')||$this.text()]);
                
            })
            .on('mousedown', function( ev ){
                ev.stopPropagation();
            })
            
            $(document).on('mousedown', function( ){
                This.dropbox.hide();
                This.options.trigger.next('.ui-select').removeClass('ui-select-focus');
            })
            
        },
        init: function(){
            
            this.eleInit();
            
        }
    }
    module.exports = select;
})