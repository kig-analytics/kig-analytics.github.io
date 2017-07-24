---
layout: post
title: TODSS: Site Discovery and Selection for Developers
feature-img: "img/chicago.png"
---
<div>
<img src="img/night.png" class="img-responsive" alt="nightlit southside" width = "1268" height = "327"/>
</div>At KIG CRE LLC. we have been building a tool to make the development site selection process more dynamic and efficient. With this tool, a developer can parametrize by zoning, TOD areas, land square footage, and the total buildable square footage on a site.

### Filtering Zoning

The first parameter many developers encounter in terms of site selection is zoning. Often, an owner has a specific zoning class or range in mind


### TOD Areas

Filter down by TOD areas. Transit-Oriented Development is critical to many developers. Our tool enables filtering zoning and building information by their distance from a particular transit node. In this example we utilize the data from the CTA L line and the Metra Commuter Line stations as our transit nodes. 

Eventually the tool will enable selection of specific transit nodes and realtime adjustent of the desired ditance from a node.


### Existing Current Structure Data

Next, it's critical to understand the current structures and their information that lie within the resulting zoning districts from Zoning & TOD filtering. Associated information includes year built, number of floors, and square footage - all useful in determing the difficulty of developing upon a site.

Note: Chicago footprint data does not have accurate building square footage data for all buildings in the city - unknown square footages are replaced with a zero.

### Determine Building Potential

Utilizing the FAR associated with a particular zoning class, we can calculate the maximum allowable floor area for a potential development in an area:

In the future, we could add other ordinaces and bonuses that city's can award for affordable housing or sustainable development practices.

### Data Diligence and Owner Identification

With our work with the Chicago datasets, we have found that updates often occur only on an annual or bi-annual basis. The resulting erosion of accuracy requires diligence with more up-to-date sources on the current use, zoning, and ownership of a given site.

For verifying ownership, we can also add an additional layer for parcel mapping, able to reveal associated ownership information from local assessor and recorder offices.

### Goal & Scaling

A singular experience of being able to add or remove any parameter layers of interest- including zoning, TOD areas (including specific locations, adjustable radii), current building footprints, buildable square footage, and ownership data.

Once complete, this tool could easily be scaled to other metropolitan areas within the United States. The primary requirement would be complete and up-to-date open datatsets from city and county governments. The datasets needed would include citywide zoning and building footprint GIS data, as well as countywide parcel GIS data. A zoning key used to understand the allowable FAR associated with each zoning class would also be useful.

### Method

Data on 