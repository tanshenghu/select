## `select` By TanShenghu

<br>

**select组件只模拟html中select标签的组件，功能除了常用的选择以外，还可以通过参数控制，显示是可勾选(checkbox)下拉框**


[demo](http://www.tanshenghu.com/widget/select/examples/select.html)

```javascript
seajs.use(['select'], function(Select) {
    
    var oselect= new Select({
        trigger: 'select',
        top: '7',
        infiniteWidth: false,
        readonly: true,
        render: function( ele ){
            ele.find('i').addClass('kuma-icon').html('&#xe642');
        },
        change: function(oselect, ui_select, key){
            
        }
    });
    
    // jquery对象：select[0]['ui-select'] 得到对应的ui对象
    // ui-select对象 ui_select[0]['select'] 得到原生select的jqueryDOM对象
    // oselect 返回select的jquery对象，并且它拥有set_uival方法
    
})
```

### 完     The End