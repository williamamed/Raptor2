/*
 * Created With Raptor
 * Copyrigth 2013
 */
 
Ext.application({
    name: 'Grid',

    // automatically create an instance of AM.view.Viewport
    autoCreateViewport: true,
    
    models: ['GenericModel'],    
    stores: ['Generic'],
    controllers: ['Generic']
});

Dino.Animated();