---
title: "MultiOmics: a study-design-aware, deterministic environment for accessible single- and multi-omics research"
tags:
  - bioinformatics
  - multi-omics
  - statistical validation
  - reproducibility
  - research software
authors:
  - name: Racym Berrah
    orcid: 0009-0001-6432-2880
    affiliation: 1
affiliations:
  - name: UMR 1248 Pharmacologie et Transplantation, Inserm, Université de Limoges, CHU de Limoges, France
    index: 1
date: 2026-10-13
bibliography: paper.bib
---

# Summary

MultiOmics is an open-source, deterministic research tool for processing
single- and multi-omics studies through a guided bilingual web interface,
scientific input checks, and optional reference methods executed by R
and Bioconductor. The interface helps researchers specify sample and
subject identifiers, study design, comparison groups, and omics-specific
measurement types. Its analysis and export modules distinguish
browser-executed exploratory calculations from DESeq2, edgeR, limma,
MOFA2 and mixOmics adapters requiring an R environment. Neither a
successful software test nor successful computation is presented as
proof that a new experiment has valid statistical inference.

# Statement of need

Routine omics software assumes users already understand metadata schemas,
biological replication, longitudinal dependence, technical batches, and
multiple-testing correction. Users without dedicated bioinformatics
support can accidentally conflate a patient with a specimen, analyze
normalized measurements as raw RNA-seq counts, or interpret a
multi-omics association as a biological mechanism. MultiOmics addresses
these practical failure modes by separating the experimental-design
questions from advanced modeling controls, offering a one-omic entry
point, and reporting checks and unresolved limitations before allowing
strong interpretation.

MultiOmics is not a novel differential-expression algorithm. Its
research-software contribution is an explicit, auditable workflow that
connects study-design eligibility, human-readable warnings, local
analyses, optional R reference implementations, and structured exports
of methods and provenance. The established statistical engines retain
their own methodological assumptions: DESeq2 [@love2014], edgeR
[@robinson2010], and limma [@ritchie2015]. Latent factor analysis may
use MOFA2 [@mofa2], but factor association alone is not a
multi-omics synergy test.

# State of the field

MultiOmics builds upon established analysis engines rather than
replacing them. Galaxy [@galaxy2024] supports reproducible workflows
over a broad ecosystem of bioinformatics tools and offers much
greater computational scope. MetaboAnalyst [@metaboanalyst2024] provides
mature metabolomics processing, statistics and interpretation.
mixOmics [@mixomics2017] and MOFA2 [@mofa2] provide sophisticated
supervised and unsupervised integrative modeling in R/Bioconductor.

The motivation for a separate interface is **not** a claim of improved
statistical performance. It is the need for a specific, bilingual
study-design and provenance layer bridging beginners to familiar
reference methods, while restricting overconfident conclusions when
subject identifiers, measurement types, contrasts or assumptions
are unresolved. Whether this workflow improves actual error rates,
analyst productivity or scientific reproducibility over those
alternatives requires an independent comparative user study.
Contributing to an existing platform remains a viable alternative,
and this component should be evaluated on the merits of its
study-design contracts and reuse, not on the number of algorithms.

# Software design

The principal design trade-off is between an immediately accessible
browser and scientifically faithful reference execution. Lightweight
deterministic JavaScript analyses support guided exploration without
installing R. Analyses relying on DESeq2, edgeR, limma and multiblock
R libraries are routed to an explicit R backend instead of
mislabeling browser approximations as those methods. Metadata
matching, independent-subject checks and eligibility checks precede
a method call; output methods records distinguish requested,
actually executed and unavailable engines.

A strict, constrained confirmatory-input path coexists with a
more permissive exploratory path. This avoids concealing unsupported
assumptions from novices, while making clear that an input contract
can never itself certify biological or statistical inference. The
trade-off is additional implementation and maintenance complexity
and a separately deployable R service. That operational cost is
preferable to silently claiming that all analyses occur in a static
browser.

# Architecture and functionality

The SvelteKit/JavaScript client serves the guided user experience and
deterministic browser checks. The `multiomics-engine/` R code contains
reference-package adapters, including an explicitly scoped RNA-seq
confirmatory-input preflight. Supported functionality encompasses
sample/feature identity validation, single-omic exploratory analyses,
cross-omic integration when multiple matched views exist, missing-data
and batch cautions, and reproducible reporting of methods used.
Operations that require Bioconductor must be run in the separately
deployed R environment and are not mislabeled as browser calculations.

Scientific safeguards are domain-specific rather than universal.
For instance, the strict RNA-seq input contract applies to integer
counts from two independent biological groups with a defined
contrast and appropriate adjustment for measured batches.
Passing the contract means **eligible for a reference fit and independent
scientific review**, not that the output is a certified confirmatory
result. Untested or unsupported plans are not silently converted
to a simpler design.

# Verification and reproducibility

Software-level checks include JavaScript contract tests, R backend
tests, browser regressions, public-dataset benchmarks, and
reference-method comparisons. A supplementary evidence register
tracks source commits, GitHub Actions runs, independent dataset counts,
code versions, and negative findings.

Two frozen computational investigations are illustrative rather than
comprehensive:

* A 400-dataset simulation matrix (1,200 actual reference R fits)
  compared DESeq2, edgeR quasi-likelihood and limma-voom under global
  null and planted-effect designs. The observed DESeq2 mean false
  discovery proportions were approximately 0.11–0.13 under the
  specified complete-null scenarios and 0.070 under the tested
  mixed-truth scenarios, exceeding the nominal 0.05 in those settings.
* An independent 300-dataset null-only diagnostic (900 actual R
  analyses) compared DESeq2's default Wald inference with sensitivity
  variants on paired simulated datasets. Removing independent
  filtering did not alter the observed false-call outcomes; a
  t-reference lowered false calls in these scenarios, but its
  sensitivity to true effects has **not** been established.

These are **adverse and incomplete inferential findings**, not a
general performance comparison or grounds to replace reference
algorithms. The machine-readable evidence and exact source hashes
are described in `research-software/multiomics/README.md`; raw
synthetic per-dataset reports must be permanently deposited before
journal submission. A separately version-pinned Bioconductor/R
container and `renv` restoration exercise reproduces the outputs
of three reference methods on one synthetic RNA-seq study with a
declared numerical tolerance, but does not validate all omics
methods or biological conclusions.

# Research impact statement

The immediately demonstrated use is software and methodological
verification: executed reference R fits, negative controls,
study-design failure gates, pinned source and reproducible
synthetic examples. In particular, two executed RNA-seq campaigns
provide 2,100 fit-level reports with source hashes and
independently rechecked results. These support *auditability* and
expose unresolved statistical limitations; they do not establish
improvement over Galaxy, MetaboAnalyst or mixOmics.

The project also includes public-dataset benchmark workflows and
guided learning materials. No independent external adoption,
peer-reviewed biological discovery or deployment in a clinical
decision workflow is claimed in this submission draft. Human
research-use feedback and sustained external contributions need
documentation before journal submission.

# AI usage disclosure

OpenAI ChatGPT (GPT-6) assisted in drafting this software-paper
text, building the publication evidence audit and creating test
scaffolding. The original repository has other development history,
and this statement does **not** purport to enumerate every past
contribution or tool used there. The submitting human authors
must inspect, edit and independently validate this assisted
material, confirm that they made and own the scientific and
software design decisions, and complete the disclosure of all
relevant tools and versions before submission. These author
attestations are **pending**, not assumed.

# Limitations and future research

A mature application and a statistically validated analytical
conclusion are different achievements. Important outstanding work
includes independent multi-cohort benchmarking of integration versus
matched single-omic baselines, further calibration and power
experiments for RNA-seq, accessibility studies with novice users,
external-replication studies with frozen preprocessing and feature
selection, and a persistent release archive. The present manuscript
is a **working software-paper draft**: it makes no claim of journal
submission, peer review, independent clinical validation, a DOI,
or an accepted 5% false discovery guarantee.

# Acknowledgements

Funding identifiers, substantive human contributors and possible
conflicts of interest are to be reviewed and entered by the submitting
authors. No external grant or institutional endorsement is inferred
from this repository.

# Availability

Source repository:
<https://github.com/rberrah/rberrah.github.io>.
The code is MIT licensed and the educational content is
CC BY-SA 4.0 licensed. The full repository contains the PMx Explain
educational site as well as MultiOmics; this paper describes **only
the MultiOmics research-software component**. For a citable
software release, its exact commit, version and DOI must be added
after a human-approved archival release.
