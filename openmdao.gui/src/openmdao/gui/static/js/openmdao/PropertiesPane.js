
var openmdao = (typeof openmdao === "undefined" || !openmdao ) ? {} : openmdao ;

openmdao.PropertiesPane = function(elm,model,pathname,name,editable,meta) {
    var self = this,
        props,
        dataView,
        meta = meta,
        searchString = "",
        current_item = {},
        inlineFilter = undefined,
        propsDiv = jQuery("<div id='"+name+"_props' class='slickgrid' style='overflow:none;'>"),
        columns = [
            {id:"name",  name:"Name",  field:"name",  width:80,  formatter:VarTableFormatter  },
            {id:"value", name:"Value", field:"value", width:80, editor:openmdao.ValueEditor},
            //{id:"valid", name:"Valid", field:"valid", width:60},
        ],
        options = {
            asyncEditorLoading: false,
            multiSelect: false,
            autoHeight: true,
            enableTextSelectionOnCells: true
        },
        _collapsed = {},
        _filter = {},
        editableInTable = {};
    self.pathname = pathname;
    if (editable) {
        options.editable = true;
        options.autoEdit = true;
    }
    
    if (meta) {
        options.autoHeight = false;
        elm.append(jQuery("<div id='inlineFilter' style='float:right;padding:10px;'>Filter <input type='text' id='" + name + "_variableFilter' style='width:100px;'></div>"));
        propsDiv=jQuery("<div id='"+name+"_props' class='slickgrid' style='overflow:none; height:360px; width:620px;'>");
        columns = [
            {id:"info",      name:"",            field:"info",      width:30, formatter:InfoFormatter },
            {id:"name",      name:"Name",        field:"name",      width:100,  formatter:VarTableFormatter },
            //{id:"type",      name:"Type",        field:"type",      width:60 },
            {id:"value",     name:"Value",       field:"value",     width:100 , editor:openmdao.ValueEditor },
            {id:"units",     name:"Units",       field:"units",     width:60  },
            //{id:"valid",     name:"Valid",       field:"valid",     width:60 },
            {id:"desc",      name:"Description", field:"desc",      width:120 },
            //{id:"connected", name:"Connected To",   field:"connected", width:100 },
            //{id:"implicit", name:"Implicitly Connected To",   field:"implicit", width:100 },
        ];
    }

    elm.append(propsDiv);
    SetupTable();

    //function to convert array to object
   function oc(a)
    {
        var o = {};
        for(var i=0;i<a.length;i++)
        {
            o[a[i]]='';
        }
        return o;
    } 

    function getExcludes(){
        return ["info", "name", "value", "units", "desc", "indent", "id", "vt", "parent", "high", "low"];
    }

    function excludeField(field, excludes){
        return (field in oc(excludes));
    }

    var valueToString = function(key, value){
        
       function numberToString(number){
           if(typeof(number) === "number"){
               if(number > 1.0e+21){
                    return number.toExponential(5);
               }

               return number.toFixed(5);
           }

           return number;
       }

       function highLowToString(highLow){
           var high = highLow.high;
           var low = highLow.low;

           return numberToString(high) + " / " + numberToString(low);
       }

       var formatters = {
            "high" : numberToString,
            "low" : numberToString,
            "high-low" : highLowToString,
       };

       function hasFormatter(key){
         return key in formatters;
       }

       function format(key, value){
           var formatter = hasFormatter(key) ? formatters[key] : function(value){
                return value;
           };

           return formatter(value);
       }

       return format(key, value);

    }; 

    var fieldNameToString = function(fieldName){

       function highLowToString(){
           return "High/Low";
       }

       var formatters = {
            "high-low" : highLowToString,
       };

       function hasFormatter(key){
         return key in formatters;
       }

       function format(key){
           var formatter = hasFormatter(key) ? formatters[key] : function(){
                return key;
           };

           return formatter();
       }

       return format(fieldName);

    }; 

    var weightedSort = function(a, b){

        var weights = {
            "type"      : 4,
            "high low"  : 3,
            "valid"     : 2,
            "connected" : 1,
            "implicit"  : 0,
        };

        var getWeight = function(str){
            return (str in weights) ? weights[str] : -1;
        }

        return getWeight(b) - getWeight(a);

    };

    var ItemFormatter = function(){
        
        this.cloneItem = function(item){
            var newItem = {};
            for(var field in item){
                newItem[field] = item[field];
            }

            return newItem;

        }

        this.groupFields = function(fields, groupName, item){
            var field;
            var newItem = this.cloneItem(item);
            var group = {};

            for(i=0;i<fields.length;i++){
                field = fields[i];
                if(! (field in item)){
                    return newItem;
                }

                group[field] = item[field];
            }

            newItem[groupName] = group;

            return newItem;
        }

        this.orderFields = function(item, comparator){
            var orderedFields = [];
            for(var field in item){
                orderedFields.push(field);
            }
            orderedFields.sort(comparator);
            return orderedFields;
        }

        this.removeFields = function(item, excludes){
           newItem = this.cloneItem(item);
           for (var field in newItem){
                if( excludeField(field, excludes)){
                    delete newItem[field];
                }
           }

           return newItem;
        }
    };

    function getToolTip(item){
        var str = "";
        var fields;
        var field;

        var formattedField = "";
        var formattedValue = "";

        var itemFormatter = undefined;
        var newItem = undefined;
        
        debug.info(pathname); 
        itemFormatter = new ItemFormatter();
        newItem = itemFormatter.cloneItem(item);
        
        newItem = itemFormatter.groupFields(["high", "low"], "high-low", item);
        newItem = itemFormatter.removeFields(newItem, getExcludes());
        
        fields = itemFormatter.orderFields(newItem, weightedSort);

        for(i=0; i<fields.length; i++){
            field = fields[i];

            formattedField = fieldNameToString(field);
            formattedValue = valueToString(field, newItem[field]);

            str = str + "<p>" + formattedField + " : " + formattedValue + "</p>";
        }

        if(str !== ""){
            return "<div id='tooltip'>" + str + "</div>";
        }
        
        return "";
    }

    function SetupTable() {
        dataView = new Slick.Data.DataView({ inlineFilters: false });
        props = new Slick.Grid(propsDiv, dataView, columns, options);
        if(meta){
            jQuery("#" + name + "_variableFilter").keyup(function (e) {
                Slick.GlobalEditorLock.cancelCurrentEdit();

                searchString = this.value.toLowerCase();
                items = dataView.getItems();
                _filter = {};
                for (i=items.length - 1; i>=0; i--){
                    name = (items[i].name) ? items[i].name.toLowerCase() : ""
                    units = (items[i].units) ? items[i].units.toLowerCase() : ""
                    description = (items[i].desc) ? items[i].desc.toLowerCase() : ""

                    if( searchString === ""){
                        _filter[items[i].id] = true;
                    }

                    else if( _filter[items[i].id] === true){
                        if( items[i].parent !== null ){
                            _filter[items[i].parent] = true;
                            _collapsed[items[i].parent] = false;
                        }
                    }
                        
                    else if(name.indexOf(searchString) !== -1 || units.indexOf(searchString) !== -1 || description.indexOf(searchString) !== -1) {
                        _filter[items[i].id] = true;
                        _collapsed[items[i].id] = false;
                        if(items[i].parent !== null){
                            _filter[items[i].parent] = true;
                            _collapsed[items[i].parent] = false;
                        }
                    }
                    
                    else {
                        _filter[items[i].id] = false;
                        _collapsed[items[i].id] = true;
                    }

                    dataView.updateItem(items[i].id, items[i]);
                }
                updateFilter({ filter: textboxFilter});
                
            });

            //TODO: On hover of variable icon should bring up tool tip with information for that row
        }
       
        props.onMouseEnter.subscribe(function(e,args){
            var cell = args.grid.getCellFromEvent(e);
            if(cell.cell === 0){
                jQuery(".variableInfo").tooltip({
                    content : function(){
                        var item = dataView.getItem(cell.row);
                        return getToolTip(item);
                    },
                    items : ".variableInfo",
                    hide : false,
                    show : false,
                    position : {
                        of : "#CE-" + pathname.replace(".", "-", "g") + "_" + name,
                        my : "right top",
                        at : "left-20 top",
                    },
                });
            }

        });

        props.onBeforeEditCell.subscribe(function(row,cell) {
            if (props.getDataItem(cell.row).connected.length > 0) {
                return false;
            }
            
            else if (props.getDataItem(cell.row).ttype == 'slot') {
                return false;
            }
    
            else {
                return true;
            }
        });
    
        props.onClick.subscribe(function (e) {
            var cell = props.getCellFromEvent(e);
            name_col_index = (meta) ? 1 : 0;
            if (cell.cell === name_col_index) {
                var item = dataView.getItem(cell.row);
                if (item.hasOwnProperty("vt")) {
                    if (!_collapsed[item.id]) {
                        _collapsed[item.id] = true;
                    } else {
                        _collapsed[item.id] = false;
                    }
                    // dataView needs to know to update.
                    dataView.setFilterArgs({filter:expansionFilter});
                    dataView.updateItem(item.id, item);
                    highlightCells();
                }
                e.stopImmediatePropagation();
            }
        });
    
        props.onCellChange.subscribe(function (e, args) {
            dataView.updateItem(args.item.id, args.item);
        });
      
        // wire up model events to drive the grid
        dataView.onRowCountChanged.subscribe(function (e, args) {
            props.resizeCanvas();
        });
        
        dataView.onRowsChanged.subscribe(function (e, args) {
            props.invalidateRows(args.rows);
            props.resizeCanvas();
        });

        if (editable) {
            props.onCellChange.subscribe(function(e,args) {
                // TODO: better way to do this (e.g. model.setProperty(path,name,value)
                model.setVariableValue(self.pathname + '.' + args.item.name, 
                                       args.item.value, args.item.type );
                // Need to clear mouse selection so that slickgrid doesn't launch
                // the editor for the next variable down (a la Excel)
                e.stopImmediatePropagation();
            });
        }
    }
    
    function InfoFormatter(row, cell, value, columnDef, dataContext){
        return "<span class='ui-icon ui-icon-info variableInfo' title='' style='display:inline-block;'></span>";
    }    

    function VarTableFormatter(row,cell,value,columnDef,dataContext) {
        var spacer ="<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px;'></span>";
        var idx = dataView.getIdxById(dataContext.id);
        var nextline = dataView.getItemByIdx(idx+1)
        if (nextline && nextline.indent > dataContext.indent) {
            if (_collapsed[dataContext.id]) {
                return spacer + " <span class='toggle expand'></span>&nbsp;" + value;
            } else {
                return spacer + " <span class='toggle collapse'></span>&nbsp;" + value;
            }
        } else {
            return spacer + "<span class='toggle'></span>" + value;
        }
    }
    
    function matchesFilter(item){
        return (item.name.indexOf(searchString) !== -1) ||
            (item.units.indexOf(searchString) !==-1 )||
            (item.description.indexOf(searchString)) !==-1
    }

    function expansionFilter(item, args){
        var idx, parent;
        if (item.parent != null) {
            idx = dataView.getIdxById(item.parent);
            parent = dataView.getItemByIdx(idx)
            while (parent) {
                if (_collapsed[parent.id]) {
                    return false;
                }
                idx = dataView.getIdxById(parent.parent);
                parent = dataView.getItemByIdx(idx);
            }
        }

        return true;

    }

    function textboxFilter(item, args){
        return _filter[item.id];
    }

    /* Function that returns false for collapsed rows, and true for the rest.
    Used by Slickgrid */
    this.filter = function myFilter(item, args) {
        return expansionFilter(item, args) && textboxFilter(item, args);
        //return true;
    }
    
    function updateFilter(args){
        dataView.setFilterArgs(args);
        dataView.refresh();
    }
    
    /* Sets the CSS style for cells based on connection status, while
    taking collapse/expand state into account. */
    function highlightCells() {
        var editableCells = {},
            idx = 0,
            properties = dataView.getItems();
        
        jQuery.each(properties, function(index, value) {
            if (self.filter(value)) {
                editableCells[idx] = editableInTable[value.id];
                idx += 1;
            }
        })
        props.setCellCssStyles("highlight", editableCells);
    }

    propsDiv.bind('resizeCanvas', function() {
        props.resizeCanvas();
    });

    /** load the table with the given properties */
    this.loadData = function(properties) {
        if (properties) {
            // Sort by name
            properties.sort(function(a, b) {
                var nameA=a.id.toLowerCase(),
                    nameB=b.id.toLowerCase();
                if (nameA < nameB) { //sort string ascending
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0; //default return value (no sorting)
            });

            jQuery.each(properties, function(index, value) {
            
                editableInTable[value.id] = {};
                _filter[value.id] = true;
                if (value.hasOwnProperty("parent")) {
                    if ( !_collapsed.hasOwnProperty(value.id) ) {
                        _collapsed[value.id] = true; 
                        _collapsed[value.parent] = true;
                    }
                }
                
                if (value.hasOwnProperty("connected")) {
                    var nameStyle = '',
                        valueStyle = '';
                    if (options.editable && (value.connected.length === 0) && (value.ttype != 'slot')) {
                        valueStyle += " cell-editable";
                    }
                    if (value.hasOwnProperty("implicit") && (value.implicit.length > 0)) {
                        //need a css class for highlighting implicitly connected inputs
                        if (name === "Inputs") {
                            nameStyle += " parameter";
                            valueStyle += " parameter";
                        }
                        else if (name === "Outputs") {
                            nameStyle += " objective";
                            valueStyle += " objective";
                        }
                    }
                    var css = {};
                    if (nameStyle !== '') {
                        css['name'] = nameStyle;
                    }
                    if (valueStyle !== '') {
                        css['value'] = valueStyle;
                    }
                    if (css !== {}) {
                        editableInTable[value.id] = css;
                    }
                }
                value["info"] = "";
                
            });

            dataView.beginUpdate();
            dataView.setItems(properties);
            //dataView.setFilterArgs({filter:expansionFilter});
            dataView.setFilter(this.filter);
            dataView.endUpdate();
            props.invalidate();

            /*jQuery(".variableInfo").tooltip( {
                    content : function(){
                        debug.info(current_item);
                        var str = "";
                        for(var field in current_item){
                            str = str + "<p>" + field + ":" + current_item[field] + "</p>";
                            str = str + "<br />"; 
                        }
                        element = jQuery("<div id='tooltip'>" + str + "</div>");
                        element.position( {
                            my : "right top",
                            at : "left top",
                        });
                        elm.append(element);
                        event.stopPropagation();
                    },
                    items : ".variableInfo",
                    hide : false,
                    show : false,

            });*/

            /*jQuery(".variableInfo").mouseleave( function(event) {
                debug.info("leaving icon");
                jQuery("#tooltip").remove();
                event.stopPropagation();

            });*/


        }
        else {
            props.setData([]);
            alert('Error getting properties for '+self.pathname+' ('+name+')');
            debug.info(self.pathname,properties);
        }
        highlightCells();
        props.resizeCanvas();
    };
};
