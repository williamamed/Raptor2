//Ext.onReady(function () {
//    store1.loadData(generateData(8));
//    
//    var chart = Ext.create('Ext.chart.Chart', {
//            style: 'background:#fff',
//            animate: true,
//            store: store1,
//            shadow: true,
//            theme: 'Category1',
//            legend: {
//                position: 'right'
//            },
//            axes: [{
//                type: 'Numeric',
//                minimum: 0,
//                position: 'left',
//                fields: ['data1', 'data2', 'data3'],
//                title: 'Number of Hits',
//                minorTickSteps: 1,
//                grid: {
//                    odd: {
//                        opacity: 1,
//                        fill: '#ddd',
//                        stroke: '#bbb',
//                        'stroke-width': 0.5
//                    }
//                }
//            }, {
//                type: 'Category',
//                position: 'bottom',
//                fields: ['name'],
//                title: 'Month of the Year'
//            }],
//            series: [ {
//                type: 'line',
//                highlight: {
//                    size: 7,
//                    radius: 7
//                },
//                axis: 'left',
//                smooth: true,
//                xField: 'name',
//                yField: 'data2',
//                markerConfig: {
//                    type: 'circle',
//                    size: 4,
//                    radius: 4,
//                    'stroke-width': 0
//                }
//            }]
//        });
//
//
//    var win = Ext.create('Ext.Window', {
//        width: 800,
//        height: 600,
//        minHeight: 400,
//        minWidth: 550,
//        hidden: false,
//        maximizable: true,
//        title: 'Line Chart',
//        renderTo: Ext.getBody(),
//        layout: 'fit',
//        tbar: [{
//            text: 'Save Chart',
//            handler: function() {
//                Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
//                    if(choice == 'yes'){
//                        chart.save({
//                            type: 'image/png'
//                        });
//                    }
//                });
//            }
//        }, {
//            text: 'Reload Data',
//            handler: function() {
//                // Add a short delay to prevent fast sequential clicks
//                window.loadTask.delay(100, function() {
//                    store1.loadData(generateData(8));
//                });
//            }
//        }],
//        items: chart
//    });
//});










Ext.onReady(function() {
    new Generator.View();
  
});

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

Ext.define('Generator.View', {
    extend: 'Ext.Viewport',
    layout: 'fit',
    
    initComponent: function() {
        this.items=new Generator.Panel();
        
        this.callParent();
    }
});

Ext.define('Generator.Panel',{
    extend:'Ext.Panel',
     layout: {
            type: 'border',
            padding: 5
        },
    title: "",
    header:false,
    
    initComponent:function(){
       this.adicionar=new Ext.Button({disabled:true,iconCls: 'icon-add', text: 'Create', handler: this.mostrarAdicionar,scope:this});
        
//       this.grid=new Generator.Grid();
       
        this.items=[this.getChart()];
        
//         this.grid.tbar=[this.adicionar,this.modificar,this.eliminar];
        
        this.tbar=[{
            text: 'Save Chart',
            handler: function() {
                Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
                    if(choice == 'yes'){
                        this.chart.save({
                            type: 'image/png'
                        });
                    }
                },this);
            },
            scope:this
            }, {
            text: 'Reload Data',
            handler: function() {
                // Add a short delay to prevent fast sequential clicks
                this.chartStore.load();
            },
                    scope:this
        }],
        
       
         this.callParent();
         this.chartStore.load();
        
       
    },
    createStore: function() {
         this.chartStore=new Ext.data.Store({
            fields: [
                {name: 'no'},
                {name: 'value'}

            ],
            proxy: {
                type: 'ajax',
                url: 'performance/list',
                actionMethods: { //Esta Linea es necesaria para el metodo de llamada POST o GET

                    read: 'POST'
                },
                reader: {
                    totalProperty: "cantidad_filas"


                }
            }
        });
        return this.chartStore;
    },
    getChart:function(){
        this.chart=Ext.create('Ext.chart.Chart', {
            style: 'background:#fff',
            animate: true,
            store: this.createStore(),
            shadow: true,
            theme: 'Purple',
            legend: {
                position: 'right'
            },
            axes: [{
                type: 'Numeric',
                minimum: 0,
                position: 'left',
                fields: ['value'],
                title: 'Duration in seconds',
                minorTickSteps: 1,
                grid: {
                    odd: {
                        opacity: 1,
                        fill: '#ddd',
                        stroke: '#bbb',
                        'stroke-width': 0.5
                    }
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['no'],
                title: 'Request Numbers'
            }],
            series: [ {
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                smooth: true,
                xField: 'no',
                yField: 'value',
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                }
            }]
        });
        return  this.chart;
    }
    
    
    
})


    

    
    




