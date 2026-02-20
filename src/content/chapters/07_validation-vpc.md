---
id: "validation-vpc"
slug: "validation-vpc"
title: "Diagnostics: VPC"
description: "Compare observed data to simulated percentiles (10–90%)."
order: 7
tags: ["diagnostic","vpc"]
slides: ["s45","s46","s47","s48","s49","s50","s51","s52","s53","s54","s55","s56"]
---

<!-- step:title="Why bin?" slides="s45,s46" viz="17_VPCCrashTest" -->
Grouping times stabilizes percentiles and makes the tunnel readable.  
Pitfall: too few bins → overly wide tunnel; too many → noise.
<!-- /step -->

<!-- step:title="Bands vs data" slides="s47,s48,s49" viz="17_VPCCrashTest" -->
Blue tunnels (p10–p90 sims) vs red points (obs). Points outside → bias or wrong variability.
<!-- /step -->

<!-- step:title="Binning sensitivity" slides="s50,s51,s52,s53,s54" viz="17_VPCCrashTest" -->
Toggle binning on/off: tunnel should remain coherent. Pitfall: irregular times without interpolation.
<!-- /step -->
