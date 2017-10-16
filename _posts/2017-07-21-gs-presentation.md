---
layout: post
title: Site Discovery and Selection for Developers
feature-img: "img/chicago.png"
published: false
---
<!-- <div>
<img src="img/night.png" class="img-responsive" alt="nightlit southside" width = "1268" height = "327"/>
</div> -->

### Introduction

Effective site selection is a critical aspect of any developer's strategy. At KIG, we're developing a tool using city, county, and transit datasets to make the site selection process both easier and more comprehensive. With this tool in hand, a developer can parametrize by zoning, TOD areas, land square footage, and the total buildable square footage on a site - all without having to leave their desk.

Utilizing the increasing number of datasets available from local governments, the overall process can be broken down as follows:
* Filter a metropolitan area by zoning classes of interest
* Filter those areas by TOD
* Determine if current buildings are fully utilizing the FAR of an ar area of interest
* Verify ownership and current use details

### The 30,000 Foot View: Filtering Zoning

The first parameter many developers encounter in the site selection process is zoning. Often, an these has a specific zoning class or classes in mind for their development.

As an example, we'll be examining the Chicago market. As local governments make their data more accessible, we can incorporate them into interactive maps that reveal the zoning layout of a city:

<iframe width="100%" height="820" frameborder="0" src="https://mrutzen1.carto.com/builder/10e23253-de3f-44f5-869c-fee3849a4196/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

As one can observe, the data is on such a scale that it would only be helpful to those already with a site in mind. To select a site without prior knowledge, particularly if a developer is less familiar with a given area, We now add further lenses of analysis to pinpoint sites of greatest interest.

### Connected to Everywhere: TOD Areas

Transit-Oriented Development (TOD) has been a growing priority for many developers in metropolitan areas across the nation. We can filter down zoning and building information by their distance from a particular transit node. In this example we utilize the station data from the CTA 'L' System and the Metra Commuter Line as our transit nodes of interest. 

<iframe width="100%" height="820" frameborder="0" src="https://mrutzen1.carto.com/builder/c2b4ff3f-e382-4190-b46a-ac82770a7e1a/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

Eventually our tool will enable selection of specific transit nodes and real-time adjustment of the desired distance from a node.

At this stage, let us focus upon one particular TOD area within the Chicago market: Logan Square. As a neighborhood that has seen a significant increase in income and education attainment levels over the past decade, it has been a hotbed of development. However, the majority of new developments in the area have occurred in other TOD areas within the neighborhood. Could there still be more buildable square footage around the Logan Square L train station?

### What's on the Land: Existing Building Data

Next, we aim to understand the buildings currently located within our areas of interest. Information of interest at this stage includes footprint area, year built, number of floors, and building square footage. All of which are factors that can affect the feasibility of development upon a given site.

<iframe width="100%" height="820" frameborder="0" src="https://mrutzen1.carto.com/builder/2a080009-2d24-4f94-877b-6c2b12cf4e87/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

Note: Chicago building data does not have accurate building square footage or year built for all buildings in the city - unknown square footages are replaced with a zero in the above mapping.

### How High can we Build: Determining Building Potential

Utilizing the FAR (Floor-to-Area Ratio) associated with a particular zoning class, we can calculate the maximum allowable floor area for a potential development in comparison with what is currently located at a site. 

<iframe src="https://player.vimeo.com/video/224944824" width="100%" height="520" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<p><a href="https://vimeo.com/224944824">Logan Square Land Analysis</a> from <a href="https://vimeo.com/kiganalytics">KIG Analytics</a> on <a href="https://vimeo.com">Vimeo</a>.</p>

A 2D and static version of the information above. To account for missing current total building square footage data, we calculated estimates using footprint area and the current number of stories for comparison against the maximum allowable square footage:

<iframe width="100%" height="820" frameborder="0" src="https://mrutzen1.carto.com/builder/fc724878-6527-11e7-bf22-0e8c56e2ffdb/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

In the future, we aim to build in other ordinances and bonuses that city's tend to award for affordable housing, sustainable development, or other practices.

### Data Diligence and Owner Identification

While working with the Chicago datasets, we have found that updates often occur only on an annual or bi-annual basis. The resulting erosion of accuracy requires diligence with more up-to-date sources on the current use and ownership of a given site.

For verifying ownership, we can also add an additional layer for parcel mapping, able to reveal associated ownership information from local assessor and recorder offices.

<iframe width="100%" height="820" frameborder="0" src="https://mrutzen1.carto.com/builder/1ebd54f5-8efc-412d-b025-6f670404414a/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

As well as using a service like OpenStreetMap to display POIs and surrounding restaurants, retail, grocery, and convenient stores. Our goal would eventually incorporate this as another seamless layer within a site selection tool.

<iframe width="100%" height="520" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.openstreetmap.org/export/embed.html?bbox=-87.71724700927736%2C41.925102965895356%2C-87.69932985305788%2C41.93243842173179&amp;layer=mapnik" style="border: 1px solid black"></iframe><br/><small><a href="https://www.openstreetmap.org/#map=17/41.92877/-87.70829">View Larger Map</a></small>

### Goal & Scaling

We aim to build a singular experience for developers to add or remove any parameter layers of interest - including zoning, TOD areas (including specific locations, adjustable radii), current building footprints, buildable square footage, and ownership data.

Once complete, this tool could be scaled to other metropolitan areas within the United States. The primary requirement would be complete and up-to-date open datasets from city and county governments. The datasets needed would include citywide zoning and building footprint GIS data, as well as countywide parcel GIS data. A zoning key used to understand the allowable FAR associated with each zoning class would also be useful.


<!-- ### Method

Data on  -->