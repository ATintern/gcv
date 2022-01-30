#!/bin/sh

set -o errexit -o pipefail

wget -O - https://data.legumeinfo.org/Medicago/truncatula/genomes/R108_HM340.gnm1.XT6J/medtr.R108_HM340.gnm1.XT6J.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        { 
            print $1, ".", $1 ~ /\.scf/ ? "supercontig" : "chromosome", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Medicago \
           --species truncatula \
           --strain R108_HM340 \
           --gene-gff https://data.legumeinfo.org/Medicago/truncatula/annotations/R108_HM340.gnm1.ann1.85YW/medtr.R108_HM340.gnm1.ann1.85YW.gcv_genes.gff3.gz \
           --gfa https://data.legumeinfo.org/Medicago/truncatula/annotations/R108_HM340.gnm1.ann1.85YW/medtr.R108_HM340.gnm1.ann1.85YW.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin
echo "exit status: $?"
