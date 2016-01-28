# Raptor 2

Starting with the first change in Raptor is the removal of the old core
and the use of Slim microframework in it's place. After a lot of testing
we fall in love of Slim to take the place of the core, with very documentation
and periodical updates.

In the beginning we decide base the arquitecture of raptor in the Symfony
proposal, reducing the congnitive charge with people that see this filosofy.

What change? Thanks to the feedbak of all kind of developer, we figure out
that exist many factors inside of this arquitecture in particular the
configurations methods that complicate or destroy our main gold of reducing
the conginitive charge. In Raptor 2 we remove the unnecesary configurations
files, routes chains through configuration and in general all the things
that can be a sustancial charge to the developer.

In real terms all the routes declarations is delegated in the definitions
to the controllers through annotations. Besides of grouping in it's real
place we remove all the execive configurations in the system, making easy
the task of developing. The configuration location or app is delegated
to the real resposability meaning that is for global configurations only,
never interfering with the bundle logic.
 
## Clients libreries

One of our goal is provide a full integration with the client side libreries
providing security mechanism to protect the comunications beetwen layers.
Raptor include Extjs, jQuery and Angular with no need of intalled, you can
create fully configuraded templates in every tecnology and just used with
no especial action needed. The Ui generator guarantee that creation in the
correct way.
The system give you access to functions in the front-end thanks to the 
javascript core always accesible through the Raptor object.

## New functions and bundles

The new characteristics include the view plugins mechanisms, inyecting
code in our definitions or in the defined by Raptor. We can do a lot of
things with this, create new javascript functions inyecting them to the
javascript core Raptor, inyect new functions to the Raptor panel etc.

The new instalation component guarantee in a visual way the installation
and the importing of bundles from a local repository(in short time can be
remote). To give support to this system we implanted the installation 
manifiest concept. This concept determine the bundle state and instalations 
directives to the Raptor bundle. In this way the system implement
the automatic detection and installation of compoments, besides the removal
of ghost bundles.

## Installation proccess

It's real easy to run and install, download the source, uncompress in your
web server and give permissions if you are in a UNIX enviroment.

After that you are ready to run Raptor in you localhost machine like this:
	http://localhost/Raptor2/web/dev.php

You must run it through the dev front in order to get the development enviroment

Enjoy your Raptor !! Is easy to use, faster to run and great to build apps
