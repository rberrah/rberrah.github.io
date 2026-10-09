#!/usr/bin/env Rscript
# Strict, non-predictive source/phenotype and feature mapping preflight.
# Prints no patient IDs; never fits a prediction or checks outcome associations.
suppressPackageStartupMessages(library(Biobase))
e<-new.env(parent=emptyenv());load("external/MAINZ/data/mainz.rda",envir=e)
m<-e$mainz
f<-new.env(parent=emptyenv());load("external/NKI/data/nki.rda",envir=f)
n<-f$nki
stopifnot(is(m,"ExpressionSet"),is(n,"ExpressionSet"))
cat("MAINZ dimensions",paste(dim(exprs(m)),collapse="x"),"chip",annotation(m),"\n")
cat("NKI dimensions",paste(dim(exprs(n)),collapse="x"),"chip",annotation(n),"\n")
for(z in c("MAINZ","NKI")){
 o<-if(z=="MAINZ")m else n
 feat<-fData(o);ph<-pData(o)
 cat(z,"feature columns",paste(colnames(feat),collapse="; "),"\n")
 cat(z,"phenotype columns",paste(colnames(ph),collapse="; "),"\n")
 for(key in grep("(?i)gene|symbol|entrez|id",names(feat),value=TRUE,perl=TRUE)){
    tab<-as.character(feat[[key]])
    good<-sum(grepl("^[1-9][0-9]*$",tab))
    cat(z,"mapping key",key,"numeric_unique_ids=",good,
        "distinct_clean=",length(unique(tab[grepl("^[1-9][0-9]*$",tab)])),
        "first_examples=",paste(utils::head(tab,3),collapse="|"),"\n")
 }
 for(key in grep("(?i)^er$|er.status|estrogen|er_",names(ph),value=TRUE,perl=TRUE)){
  p<-ph[[key]]
  cat(z,"ER phenotype key",key,"counts",
      paste(names(table(p,useNA="ifany")),as.vector(table(p,useNA="ifany")),collapse="; "),"\n")
 }
}
cat("CROSS_PLATFORM_PREFLIGHT_COMPLETE\n")
