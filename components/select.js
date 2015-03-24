/**
 * Created by tarakesh on 2/26/15.
 */
(function($){

    'use strict';

    $.expr[":"].contains = $.expr.createPseudo(function(arg) {
        return function( elem ) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });

    $.fn.bootstrapSelect = function(options, args){

        var _settings = {
            search: false,
            multiselect: false,
            autoClose: true,
            ajax : null
        };

        var that = $(this),
            parent = $(this).parent(),
            selector = that.find(".selector").length == 0 ? null : that.find(".selector"),
            listRow = that.find(".list").length  == 0 ? null : that.find(".list"),
            ul =  that.find("ul").length == 0 ? null : that.find("ul"),
            search = that.find(".search").length == 0 ? null : that.find(".search");


        var _get = function(){

                //console.log("get value",  selector.val(), "get text",  selector.attr("data-value") )
                return {
                    text :  selector.val(),
                    value : selector.attr("data-value"),
                    index : ul.find('li[data-value="'+selector.attr("data-value")+'"]').data("index")
                }

            },

            _showAll = function(){

                ul.children().show();
            },

            _hide = function(){

                listRow.hide()
            },

            _add = function(item){

            },

            _delete = function(){

            },

            _events = function(){

                //init all selectors
                if(selector == null){selector =  that.find(".selector")};
                if(listRow == null){listRow =  that.find(".list")};
                if(ul == null){ul =  that.find("ul")};
                if(search == null){search =  that.find(".search")};


                //selector click
                selector.on("click", _onSelectorClick)


                //on item select
                ul.on("click", "li", _onItemClick);

                if(_settings.multiselect) {

                    ul.on("click", "li input", _onCheckboxSelect);
                }

                //enable search
                if(_settings.search){

                    search.on("keyup", _onSearch).on("click", function(e){ e.stopPropagation(); })
                }

                $(document).on("click",function (e) {
                    _hide();
                });


            },

            _onSelectorClick = function (e) {

                e.stopPropagation();
                listRow.toggle();

            },

            _onItemClick = function(e){

                var li = $(this);

                e.stopPropagation();

                if(_settings.multiselect) {

                    var chk = li.find("input[type='checkbox']"),
                        chkd = chk.prop("checked");

                    chk.prop("checked", !chkd);

                    ul.parent().blur()
                }

                else
                {
                    _hide();
                }


                _updateSelector(li);
            },

            _onCheckboxSelect = function(e) {

                ///e.stopPropagation();
                $(this).parent().click();
            },

            _onSearch = function(e){

                var txt = $(this).val().trim();

                if(txt.length > 0 ) {
                    var found1 = ul.children('li:contains("' + txt + '")');

                    ul.children().not(found1).hide()
                }
                else{
                    _showAll();
                }
            },

            _setDefault = function(){

                var li =  that.find("li").first(); //first li

                selector.val(li.data("text")).attr("data-value", li.data("value"))
                    .attr("value", li.data("text"));

                if(_settings.multiselect){
                    ul.find("input[type='checkbox']").first().prop("checked", true)
                }
            },

            _updateSelector = function(li){

                if(_settings.multiselect){

                    var selChks = ul.find("input:checked"),
                     str = [],
                     json =[];

                    $.each(selChks, function(i, c){
                        str.push($(c).parent().attr("data-text"));
                        json.push({text : $(c).parent().attr("data-text"), value : $(c).parent().attr("data-value")})
                    })

                    selector.val('').val(str.join(', '))
                        .attr("data-value", JSON.stringify(json))
                        .attr("value", str.join(', '))

                    return;
                }

                selector.val(li.data("text")).attr("data-value", li.data("value"))
                    .attr("value", li.data("text"));
            },

            _createHtml = function(){

                var wrapperArr =
                    ['<div class="'+that.attr('class')+'" id="'+that.get(0).id+'">',
                     '<div class="row">',
                     '<div class="col-md-12">',
                     '<input type="text" class="form-control selector" placeholder="Nothing selected" data-value="" value="" readonly="true"/>',
                     '<span class="glyphicon glyphicon-chevron-down"></span>',
                     '</div></div>',
                     '<div class="row list">',
                     '<div class="col-md-12 col-lg-12 col-sm-12">',
                      (_settings.search) ? '<input type="text" class="form-control search" placeholder="Search" /><span class="glyphicon glyphicon-search"></span>' : '',
                     '<ul></ul>',
                     '</div></div></div>'
                    ],
                    liArr = [],
                    selectObj  = $(wrapperArr.join(''));

                if(_settings.ajax == null) {

                    $.each(that.children("option"), function (i, op) {
                        op = $(op);

                        //TODO: check for multiselect to create checkbox
                        var li = $('<li/>').
                            attr(
                            {
                                "data-value": op.val(),
                                "data-text": op.text().trim(),
                                "data-index": i
                            });

                        if (_settings.multiselect) {
                            liArr.push(li.append('<input type="checkbox" /><span>' + op.text().trim() + '</span>').get(0).outerHTML)
                        } else {
                            liArr.push(li.text(op.text().trim()).get(0).outerHTML)
                        }
                    })
                    _render(selectObj, liArr, parent)

                }
                else{

                    $.ajax($.extend(_settings.ajax, {
                        contentType : "application/json",
                        success : function(d){
                           // console.log(d[_settings.ajax.dataKey]);
                            $.each(d[_settings.ajax.dataKey], function (i, op) {
                                //TODO: check for multiselect to create checkbox
                                var li = $('<li/>').
                                    attr(
                                    {
                                        "data-value": op.value,
                                        "data-text": op.text,
                                        "data-index": i
                                    });

                                if (_settings.multiselect) {
                                    liArr.push(li.append('<input type="checkbox" /><span>' + op.text + '</span>').get(0).outerHTML)
                                } else {
                                    liArr.push(li.text(op.text).get(0).outerHTML)
                                }
                            })

                            _render(selectObj, liArr, parent)
                        },
                        error : function(a,b){
                            console.log("bootstrap select ajax error", a,b)
                        }
                    }))
                }

            },

            _render = function(selectObj, liArr, parent){

                selectObj.find("ul").append($(liArr.join('')));

                that.replaceWith(selectObj);

                //move selectionObj to that
                that = selectObj

                _events();

                _setDefault()
            },

            _init= function() {
                _createHtml();
            }

        //get selected info
        this.get = function(){
           return _get();
        }

        //add item at a specifc index. if index is not provided default add to last
        this.add = function(item){
            console.log(item.text, item.value, item.index);
            return true;
        }


        //remove item by index
        this.removeByIndex = function(index){

        }


        //remove item by value
        this.removeByValue = function(value){

        }

        //remove item by text
        this.removeByText = function(text){

        }

        /*if options is a string ie we are asking for a function to execute*/
        if(typeof options === "string")
        {
           return this[options].call(this, (args == undefined) ? null : args);
        }

        /* this is used to create html for the select element */
        if( typeof  options === "object" || options ==  undefined){
            _settings = $.extend(_settings, options || {});
            _init();
        }


        //return this;

    }

})(jQuery)

/*TO DO
 * 1. add enter key support
 * 2. add down and up arrow support
 * 3. add ajax support
 * 4. add item support
 * 5. delete item support
  * */