---
layout: page
title: Institutional Investment Across Chicago
feature-img: "img/chicago.png"
page: investment-sankey
---
<style>

& p.subheading {
        font-size: 1.75rem;
        color: #525252;
        font-style:italic;
    }
    & .row.mt-0{
        margin-left:0;
        margin-right:0;
    }
    #axis-label{
        margin-right: 30px;
        & .col-md-6{
            padding:3px;
            & h6{
                margin-bottom: 0px;
                margin-top:0px;
                padding-right: 10px;
                padding-left: 10px;
            }
        }
    }
    #viz_container{
        overflow: visible;
        position: relative;
        height: inherit;
        margin-top:20px;
    }
    .node rect {
        cursor: move;
        fill-opacity: .9;
        shape-rendering: crispEdges;
    }
    .node text {
        pointer-events: none;
        text-shadow: 0 1px 0 #fff;
    }
    .link {
        fill: none;
        stroke: #000;
        stroke-opacity: .1;
    }
    #sankey-panel {
        overflow: visible;
        position: relative;
        float: right;
        text-align:left;
        /*left:730px;
        padding-right:20px;
        padding-left:40px;*/
        height: inherit;
        margin-top: 0px;
        margin-left:0px;
        background-color: inherit;
    }
    .panel_desc{
        margin-top: 10px;
    }
    #tab{
        margin-top: -20px;
        margin-bottom: 25px;
    }

    #tab_2 > table.icon{
        margin-bottom: 3.5px;
    }
    #tab_2 > table > tbody > tr > td.val{
        width: 216px;
        height:15px;
        overflow:invisible;
    }
    #tab_2 > table > tbody > tr > td.name{
        width: 270px;
        height:15px;
        overflow:visible;
    }
    #tab_2 {
        /*height:40px;*/
        width:385px;
        margin-top:2px;
        margin-bottom:-15px;
    }
    #sankey-panel h1 {
        font-size: 2em;
        font-style: inherit;
        font-weight: lighter;
        margin-top: 0;
        margin-left: 0;
        margin-right: 0;
        margin-bottom: 10px;
        padding: 0;
        color: #0071BC;
        line-height:110%;
        }
    #sankey-panel h2 {
        font-size: 2.1em;
        font-style: inherit;
        font-weight: ultra-light;
        margin: 0;
        padding: 0;
        color: #666666;
    }
    #sankey-panel h3 {
        font-size: 1.4em;
        margin: 0;
        padding: 0;
        text-transform: capitalize;
        /*font-variant:small-caps;*/
        color: #555555;
    }
    #sankey-panel h4 {
        font-size: 1.5em;
        text-transform: capitalize;
        /*font-variant:small-caps;*/
        font-style: inherit;
        color: #555555;
    }
    #sankey-panel p {
        font-style: inherit;
        font-size: .8em;
        line-height: 110%;
        /*margin-top: -3px;
        text-transform: capitalize;
        font-variant:small-caps;*/
        color: #555555;
    }
    #tite_text {
        margin-top: 10px;
        width: 800px;
    }
    #tite_text > p.headline {
        position: relative;
        font-size: 2em;
    }
    #tite_text > p.body_text {
        position: relative;
        font-size: 1.1em;
        margin-top: -15px;
    }
    #description > p.body_text {
        position: relative;
        font-size: 1.1em;
        margin-top: -15px;
    }
    #references{
        .p {
                margin-bottom: 1.5rem;
        }
    }

</style>

<h2 style="margin-top:0; margin-bottom:10px">Institutional Investment Across Chicago Neighborhoods </h2>
<p class="subheading">Connecting Neighborhoods to Institutions 2010 - 2017</p>
<div class="row mt-0">
    <div class="col-md-8" style="margin-left:0; padding-left:0; padding-right:30px">
        <p></p>
    </div>
    <div class="col-md-4" style="padding-left:0">
        <div style="border-color:#d6d7d9; border-width: 1px; border-style: solid; padding:10px; margin-bottom:40px">
            <h6 style="margin-top:0; margin-bottom:5px">How to use this tool:</h6>
            <p style="margin-bottom:0">Hover over each color bar to highlight how each neighborhood relates to investment institutions, and vice versa.</p>
        </div>
    </div>
</div>

<iframe width="998" height="1240" frameborder="0" src="https://kiganalytics.carto.com/builder/33200670-8d91-4025-86ca-ae5d6be22894/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

<div class="row mt-0">
    <div class="col-md-7" style="padding:10px">
        <div class="row mt-0">
            <div id="axis-label">
                <div class="col-md-6">
                    <h6>Neighborhood:</h6>
                </div>
                <div class="col-md-6">
                    <h6 style="text-align:right">Institution:</h6>
                </div>
            </div>
        </div>
        <div class="row mt-0">
            <div id="viz_container"></div>
        </div>
    </div>

    <div class="col-md-5" style="padding:10px">
        <div id="sankey-panel"></div>
    </div>
</div>
<!-- <div class="row mt-0">
    <div id="references">
        <h5> How this analysis was conducted</h5>
        <p>This analysis was conducted using agency account obligation data reported to USAspending.gov, which is available to the public. Each reported account is aligned to a single Budget Function and is further broken out by the dollars obligated under each Object Class (data can be found via the TAS/categories endpoint within the DATA Act API). Summarizing across all agency accounts can provide the total dollars obligated under each unique combination of Budget Function and Object Class which populates the visualization above.The data used in this tool was pulled as of September 22, 2017.</p>
    </div>
</div> -->
<!-- d3 -->
<script src="d3.v3.min.js"></script>
<script src="investment-sankey.js"></script>