---
layout: post
title: Site Discovery and Selection for Developers
feature-img: "img/chicago.png"
---
<!-- <div>
<img src="img/night.png" class="img-responsive" alt="nightlit southside" width = "1268" height = "327"/>
</div> -->
Effective site selection is a critical aspect of any developer's strategy. At KIG, we're in the process of developing a tool using city, county, and transit datasets to make the site selection process more dynamic and efficient. With this tool, a developer can parametrize by zoning, TOD areas, land square footage, and the total buildable square footage on a site.

### The 30,000 Foot View: Filtering Zoning

The first parameter many developers encounter in terms of site selection is zoning. Often, an owner has a specific zoning class or range in mind.

As an example, we'll be examining the Chicago market. As local governments make their data public and more accessible, we can incorporate them into interactive maps that reveal the zoning layout of a city:

<iframe width="100%" height="520" frameborder="0" src="https://mrutzen1.carto.com/builder/10e23253-de3f-44f5-869c-fee3849a4196/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

As one can observe, the data is on such a scale that to use the raw data in this form would only be helpful to those already with a site in mind. We now add further lenses of analysis to pinpoint sites of greatest interest.

### TOD Areas

Transit-Oriented Development has been a growing priority for many developers in metropolitan areas across the nation. Our tool can filter down zoning and building information by their distance from a particular transit node. In this example we utilize the data from the CTA L line and the Metra Commuter Line stations as our transit nodes of interest. 

<iframe width="100%" height="520" frameborder="0" src="https://mrutzen1.carto.com/builder/c2b4ff3f-e382-4190-b46a-ac82770a7e1a/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

Eventually the tool will enable selection of specific transit nodes and realtime adjustent of the desired ditance from a node.

### Existing Building Data

Next, we aim to understand the buildings currently located within our areas of interest. Information of interest at this stage includes footprint area, year built, number of floors, and building square footage. All of which are factors that can affect the feasability of development upon a given site.

<iframe width="100%" height="520" frameborder="0" src="https://mrutzen1.carto.com/builder/2a080009-2d24-4f94-877b-6c2b12cf4e87/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

Note: Chicago footprint data does not have accurate building square footage data for all buildings in the city - unknown square footages are replaced with a zero.

### Determine Building Potential

Utilizing the FAR (Floor-to-Area Ratio) associated with a particular zoning class, we can calculate the maximum allowable floor area for a potential development in comparison with what is currently located at a site. 

For this analysis we focus upon one particular TOD area within the Chicago market: Logan Square. As a neighborhood that has seen a significant increase in income and education attainment levels over the past decade, it has been a hotbed of development. However, the majority of new developments in the area have occured in other TOD areas within the neihgborhood. Could there still be more buildable square footage around the Logan Square L train station?

<iframe src="https://player.vimeo.com/video/224944824" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<p><a href="https://vimeo.com/224944824">Logan Square Land Analysis</a> from <a href="https://vimeo.com/kiganalytics">KIG Analytics</a> on <a href="https://vimeo.com">Vimeo</a>.</p>

A 2D and static version of the information above:

<iframe width="100%" height="520" frameborder="0" src="https://mrutzen1.carto.com/builder/fc724878-6527-11e7-bf22-0e8c56e2ffdb/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

In the future, we aim to build in other ordinaces and bonuses that city's tend to award for affordable housing, sustainable development, or other practices.

### Data Diligence and Owner Identification

With our work with the Chicago datasets, we have found that updates often occur only on an annual or bi-annual basis. The resulting erosion of accuracy requires diligence with more up-to-date sources on the current use and ownership of a given site.

For verifying ownership, we can also add an additional layer for parcel mapping, able to reveal associated ownership information from local assessor and recorder offices.

<iframe width="100%" height="520" frameborder="0" src="https://mrutzen1.carto.com/builder/1ebd54f5-8efc-412d-b025-6f670404414a/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

As well as using a service like OpenStreetMap to display POIs and surrounding restarauants, reatail, grocery, and convenient stores. Our goal would evenutally incorporate this as another seemless layer within a site selection tool.

<iframe width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://www.openstreetmap.org/export/embed.html?bbox=-87.71724700927736%2C41.925102965895356%2C-87.69932985305788%2C41.93243842173179&amp;layer=mapnik" style="border: 1px solid black"></iframe><br/><small><a href="https://www.openstreetmap.org/#map=17/41.92877/-87.70829">View Larger Map</a></small>

### Goal & Scaling

A singular experience of being able to add or remove any parameter layers of interest- including zoning, TOD areas (including specific locations, adjustable radii), current building footprints, buildable square footage, and ownership data.

Once complete, this tool could be scaled to other metropolitan areas within the United States. The primary requirement would be complete and up-to-date open datatsets from city and county governments. The datasets needed would include citywide zoning and building footprint GIS data, as well as countywide parcel GIS data. A zoning key used to understand the allowable FAR associated with each zoning class would also be useful.

<!-- ### Method

Data on  -->