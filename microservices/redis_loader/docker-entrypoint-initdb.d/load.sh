#!/bin/bash

set -o errexit -o pipefail

#cannot get this to work via the pipe strategy due apparently to wget terminating the connection prematurely and consistently when the wget is performed in a pipeline as all others. For whtever reason, it seems to work this way- weird!
#NB: thought I could get rid of this when the gnm2 for this came along, but it will have to wait until we have new trees
echo "cajca.ICPL87119.gnm1.ann1"
wget https://data.legumeinfo.org/Cajanus/cajan/annotations/ICPL87119.gnm1.ann1.Y27M/cajca.ICPL87119.gnm1.ann1.Y27M.gene_models_main.gff3.gz
wget -O - https://data.legumeinfo.org/Cajanus/cajan/genomes/ICPL87119.gnm1.SBGP/cajca.ICPL87119.gnm1.SBGP.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Cc[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Cajanus \
           --species cajan \
           --strain ICPL87119 \
           --gene-gff <(zcat cajca.ICPL87119.gnm1.ann1.Y27M.gene_models_main.gff3.gz | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Cajanus/cajan/annotations/ICPL87119.gnm1.ann1.Y27M/cajca.ICPL87119.gnm1.ann1.Y27M.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin
#           --gene-gff <(wget -O - https://data.legumeinfo.org/Cajanus/cajan/annotations/ICPL87119.gnm1.ann1.Y27M/cajca.ICPL87119.gnm1.ann1.Y27M.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
rm cajca.ICPL87119.gnm1.ann1.Y27M.gene_models_main.gff3.gz


echo "aesev.CIAT22838.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Aeschynomene/evenia/genomes/CIAT22838.gnm1.XF73/aesev.CIAT22838.gnm1.XF73.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        { 
            print $1, ".", $1 ~ /Ae[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Aeschynomene \
           --species evenia \
           --strain CIAT22838 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Aeschynomene/evenia/annotations/CIAT22838.gnm1.ann1.ZM3R/aesev.CIAT22838.gnm1.ann1.ZM3R.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Aeschynomene/evenia/annotations/CIAT22838.gnm1.ann1.ZM3R/aesev.CIAT22838.gnm1.ann1.ZM3R.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "aradu.V14167.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Arachis/duranensis/genomes/V14167.gnm1.SWBf/aradu.V14167.gnm1.SWBf.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        { 
            print $1, ".", $1 ~ /A[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Arachis \
           --species duranensis \
           --strain V14167 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Arachis/duranensis/annotations/V14167.gnm1.ann1.cxSM/aradu.V14167.gnm1.ann1.cxSM.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Arachis/duranensis/annotations/V14167.gnm1.ann1.cxSM/aradu.V14167.gnm1.ann1.cxSM.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

#would use gnm2 but it runs into problems with genes in the protein file but not the gff
#wget -O - https://data.legumeinfo.org/Arachis/hypogaea/genomes/Tifrunner.gnm2.J5K5/arahy.Tifrunner.gnm2.J5K5.genome_main.fna.gz.fai |
echo "arahy.Tifrunner.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Arachis/hypogaea/genomes/Tifrunner.gnm1.KYV3/arahy.Tifrunner.gnm1.KYV3.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        { 
            print $1, ".", $1 ~ /Arahy\.[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Arachis \
           --species hypogaea \
           --strain Tifrunner \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Arachis/hypogaea/annotations/Tifrunner.gnm1.ann1.CCJH/arahy.Tifrunner.gnm1.ann1.CCJH.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Arachis/hypogaea/annotations/Tifrunner.gnm1.ann1.CCJH/arahy.Tifrunner.gnm1.ann1.CCJH.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "araip.K30076.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Arachis/ipaensis/genomes/K30076.gnm1.bXJ8/araip.K30076.gnm1.bXJ8.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /B[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Arachis \
           --species ipaensis \
           --strain K30076 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Arachis/ipaensis/annotations/K30076.gnm1.ann1.J37m/araip.K30076.gnm1.ann1.J37m.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Arachis/ipaensis/annotations/K30076.gnm1.ann1.J37m/araip.K30076.gnm1.ann1.J37m.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "cajca.ICPL87119.gnm2.ann1"
wget -O - https://data.legumeinfo.org/Cajanus/cajan/genomes/ICPL87119.gnm2.KL9M/cajca.ICPL87119.gnm2.KL9M.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /chr[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Cajanus \
           --species cajan \
           --strain ICPL87119 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Cajanus/cajan/annotations/ICPL87119.gnm2.ann1.L3ZH/cajca.ICPL87119.gnm2.ann1.L3ZH.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Cajanus/cajan/annotations/ICPL87119.gnm2.ann1.L3ZH/cajca.ICPL87119.gnm2.ann1.L3ZH.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "cicar.CDCFrontier.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Cicer/arietinum/genomes/CDCFrontier.gnm1.GkHc/cicar.CDCFrontier.gnm1.GkHc.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Ca[0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Cicer \
           --species arietinum \
           --strain CDCFrontier \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Cicer/arietinum/annotations/CDCFrontier.gnm1.ann1.nRhs/cicar.CDCFrontier.gnm1.ann1.nRhs.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Cicer/arietinum/annotations/CDCFrontier.gnm1.ann1.nRhs/cicar.CDCFrontier.gnm1.ann1.nRhs.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glycy.G1267.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Glycine/cyrtoloba/genomes/G1267.gnm1.YWW6/glycy.G1267.gnm1.YWW6.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species cyrtoloba \
           --strain G1267 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/cyrtoloba/annotations/G1267.gnm1.ann1.HRFD/glycy.G1267.gnm1.ann1.HRFD.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/cyrtoloba/annotations/G1267.gnm1.ann1.HRFD/glycy.G1267.gnm1.ann1.HRFD.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glyd3.G1403.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Glycine/D3-tomentella/genomes/G1403.gnm1.CL6K/glyd3.G1403.gnm1.CL6K.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species D3-tomentella \
           --strain G1403 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/D3-tomentella/annotations/G1403.gnm1.ann1.XNZQ/glyd3.G1403.gnm1.ann1.XNZQ.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/D3-tomentella/annotations/G1403.gnm1.ann1.XNZQ/glyd3.G1403.gnm1.ann1.XNZQ.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glydo.G1134.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Glycine/dolichocarpa/genomes/G1134.gnm1.PP7B/glydo.G1134.gnm1.PP7B.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species dolichocarpa \
           --strain G1134 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/dolichocarpa/annotations/G1134.gnm1.ann1.4BJM/glydo.G1134.gnm1.ann1.4BJM.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/dolichocarpa/annotations/G1134.gnm1.ann1.4BJM/glydo.G1134.gnm1.ann1.4BJM.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glyfa.G1718.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Glycine/falcata/genomes/G1718.gnm1.B1PY/glyfa.G1718.gnm1.B1PY.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species falcata \
           --strain G1718 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/falcata/annotations/G1718.gnm1.ann1.2KSV/glyfa.G1718.gnm1.ann1.2KSV.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/falcata/annotations/G1718.gnm1.ann1.2KSV/glyfa.G1718.gnm1.ann1.2KSV.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glyma.Wm82.gnm4.ann1"
wget -O - https://data.legumeinfo.org/Glycine/max/genomes/Wm82.gnm4.4PTR/glyma.Wm82.gnm4.4PTR.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Gm[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species max \
           --strain Wm82 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/max/annotations/Wm82.gnm4.ann1.T8TQ/glyma.Wm82.gnm4.ann1.T8TQ.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/max/annotations/Wm82.gnm4.ann1.T8TQ/glyma.Wm82.gnm4.ann1.T8TQ.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glyso.PI483463.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Glycine/soja/genomes/PI483463.gnm1.YJWS/glyso.PI483463.gnm1.YJWS.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Gs[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species soja \
           --strain PI483463 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/soja/annotations/PI483463.gnm1.ann1.3Q3Q/glyso.PI483463.gnm1.ann1.3Q3Q.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/soja/annotations/PI483463.gnm1.ann1.3Q3Q/glyso.PI483463.gnm1.ann1.3Q3Q.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glyst.G1974.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Glycine/stenophita/genomes/G1974.gnm1.7MZB/glyst.G1974.gnm1.7MZB.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species stenophita \
           --strain G1974 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/stenophita/annotations/G1974.gnm1.ann1.F257/glyst.G1974.gnm1.ann1.F257.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/stenophita/annotations/G1974.gnm1.ann1.F257/glyst.G1974.gnm1.ann1.F257.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glysy.G1300.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Glycine/syndetika/genomes/G1300.gnm1.C11H/glysy.G1300.gnm1.C11H.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species syndetika \
           --strain G1300 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/syndetika/annotations/G1300.gnm1.ann1.RRK6/glysy.G1300.gnm1.ann1.RRK6.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/syndetika/annotations/G1300.gnm1.ann1.RRK6/glysy.G1300.gnm1.ann1.RRK6.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "lotja.MG20.gnm3.ann1"
wget -O - https://data.legumeinfo.org/Lotus/japonicus/genomes/MG20.gnm3.QPGB/lotja.MG20.gnm3.QPGB.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Lj[1-6]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Lotus \
           --species japonicus \
           --strain MG20 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Lotus/japonicus/annotations/MG20.gnm3.ann1.WF9B/lotja.MG20.gnm3.ann1.WF9B.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Lotus/japonicus/annotations/MG20.gnm3.ann1.WF9B/lotja.MG20.gnm3.ann1.WF9B.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "lupal.Amiga.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Lupinus/albus/genomes/Amiga.gnm1.F4NR/lupal.Amiga.gnm1.F4NR.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr[0-9][0-9]$/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Lupinus \
           --species albus \
           --strain Amiga \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Lupinus/albus/annotations/Amiga.gnm1.ann1.3GKS/lupal.Amiga.gnm1.ann1.3GKS.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Lupinus/albus/annotations/Amiga.gnm1.ann1.3GKS/lupal.Amiga.gnm1.ann1.3GKS.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "lupan.Tanjil.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Lupinus/angustifolius/genomes/Tanjil.gnm1.Qq0N/lupan.Tanjil.gnm1.Qq0N.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /NLL-[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Lupinus \
           --species angustifolius \
           --strain Tanjil \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Lupinus/angustifolius/annotations/Tanjil.gnm1.ann1.nnV9/lupan.Tanjil.gnm1.ann1.nnV9.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Lupinus/angustifolius/annotations/Tanjil.gnm1.ann1.nnV9/lupan.Tanjil.gnm1.ann1.nnV9.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "medsa.XinJiangDaYe.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Medicago/sativa/genomes/XinJiangDaYe.gnm1.12MR/medsa.XinJiangDaYe.gnm1.12MR.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /chr[1-8]\.[1-4]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Medicago \
           --species sativa \
           --strain XinJiangDaYe \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Medicago/sativa/annotations/XinJiangDaYe.gnm1.ann1.RKB9/medsa.XinJiangDaYe.gnm1.ann1.RKB9.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Medicago/sativa/annotations/XinJiangDaYe.gnm1.ann1.RKB9/medsa.XinJiangDaYe.gnm1.ann1.RKB9.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "medtr.A17.gnm5.ann1_6"
wget -O - https://data.legumeinfo.org/Medicago/truncatula/genomes/A17.gnm5.MVZ2/medtr.A17.gnm5.MVZ2.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /MtrunA17Chr[1-8]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Medicago \
           --species truncatula \
           --strain A17 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Medicago/truncatula/annotations/A17.gnm5.ann1_6.L2RX/medtr.A17.gnm5.ann1_6.L2RX.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Medicago/truncatula/annotations/A17.gnm5.ann1_6.L2RX/medtr.A17.gnm5.ann1_6.L2RX.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "phaac.Frijol_Bayo.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Phaseolus/acutifolius/genomes/Frijol_Bayo.gnm1.QH8L/phaac.Frijol_Bayo.gnm1.QH8L.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Phaseolus \
           --species acutifolius \
           --strain Frijol_Bayo \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Phaseolus/acutifolius/annotations/Frijol_Bayo.gnm1.ann1.ML22/phaac.Frijol_Bayo.gnm1.ann1.ML22.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Phaseolus/acutifolius/annotations/Frijol_Bayo.gnm1.ann1.ML22/phaac.Frijol_Bayo.gnm1.ann1.ML22.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "phalu.G27455.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Phaseolus/lunatus/genomes/G27455.gnm1.7NXX/phalu.G27455.gnm1.7NXX.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Pl[0-9][0-9]$/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Phaseolus \
           --species lunatus \
           --strain G27455 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Phaseolus/lunatus/annotations/G27455.gnm1.ann1.JD7C/phalu.G27455.gnm1.ann1.JD7C.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Phaseolus/lunatus/annotations/G27455.gnm1.ann1.JD7C/phalu.G27455.gnm1.ann1.JD7C.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "phavu.G19833.gnm2.ann1"
wget -O - https://data.legumeinfo.org/Phaseolus/vulgaris/genomes/G19833.gnm2.fC0g/phavu.G19833.gnm2.fC0g.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr[0-9][0-9]$/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Phaseolus \
           --species vulgaris \
           --strain G19833 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Phaseolus/vulgaris/annotations/G19833.gnm2.ann1.PB8d/phavu.G19833.gnm2.ann1.PB8d.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Phaseolus/vulgaris/annotations/G19833.gnm2.ann1.PB8d/phavu.G19833.gnm2.ann1.PB8d.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "pissa.Cameor.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Pisum/sativum/genomes/Cameor.gnm1.P4FG/pissa.Cameor.gnm1.P4FG.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /chr[1-8]LG[1-8]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Pisum \
           --species sativum \
           --strain Cameor \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Pisum/sativum/annotations/Cameor.gnm1.ann1.7SZR/pissa.Cameor.gnm1.ann1.7SZR.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Pisum/sativum/annotations/Cameor.gnm1.ann1.7SZR/pissa.Cameor.gnm1.ann1.7SZR.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "tripr.MilvusB.gnm2.ann1"
wget -O - https://data.legumeinfo.org/Trifolium/pratense/genomes/MilvusB.gnm2.gNmT/tripr.MilvusB.gnm2.gNmT.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Tp[1-7]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Trifolium \
           --species pratense \
           --strain MilvusB \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Trifolium/pratense/annotations/MilvusB.gnm2.ann1.DFgp/tripr.MilvusB.gnm2.ann1.DFgp.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Trifolium/pratense/annotations/MilvusB.gnm2.ann1.DFgp/tripr.MilvusB.gnm2.ann1.DFgp.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "trisu.Daliak.gnm2.ann1"
wget -O - https://data.legumeinfo.org/Trifolium/subterraneum/genomes/Daliak.gnm2.VJZB/trisu.Daliak.gnm2.VJZB.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Trifolium \
           --species subterraneum \
           --strain Daliak \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Trifolium/subterraneum/annotations/Daliak.gnm2.ann1.MFKF/trisu.Daliak.gnm2.ann1.MFKF.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Trifolium/subterraneum/annotations/Daliak.gnm2.ann1.MFKF/trisu.Daliak.gnm2.ann1.MFKF.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "vigan.Gyeongwon.gnm3.ann1"
wget -O - https://data.legumeinfo.org/Vigna/angularis/genomes/Gyeongwon.gnm3.JyYC/vigan.Gyeongwon.gnm3.JyYC.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Va[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Vigna \
           --species angularis \
           --strain Gyeongwon \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Vigna/angularis/annotations/Gyeongwon.gnm3.ann1.3Nz5/vigan.Gyeongwon.gnm3.ann1.3Nz5.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Vigna/angularis/annotations/Gyeongwon.gnm3.ann1.3Nz5/vigan.Gyeongwon.gnm3.ann1.3Nz5.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "vigra.VC1973A.gnm6.ann1"
wget -O - https://data.legumeinfo.org/Vigna/radiata/genomes/VC1973A.gnm6.3nL8/vigra.VC1973A.gnm6.3nL8.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Vr[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Vigna \
           --species radiata \
           --strain VC1973A \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Vigna/radiata/annotations/VC1973A.gnm6.ann1.M1Qs/vigra.VC1973A.gnm6.ann1.M1Qs.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Vigna/radiata/annotations/VC1973A.gnm6.ann1.M1Qs/vigra.VC1973A.gnm6.ann1.M1Qs.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "vigun.IT97K-499-35.gnm1.ann2"
wget -O - https://data.legumeinfo.org/Vigna/unguiculata/genomes/IT97K-499-35.gnm1.QnBW/vigun.IT97K-499-35.gnm1.QnBW.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Vu[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Vigna \
           --species unguiculata \
           --strain IT97K-499-35 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Vigna/unguiculata/annotations/IT97K-499-35.gnm1.ann2.FD7K/vigun.IT97K-499-35.gnm1.ann2.FD7K.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Vigna/unguiculata/annotations/IT97K-499-35.gnm1.ann2.FD7K/vigun.IT97K-499-35.gnm1.ann2.FD7K.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin


#genomes included because they are grandfathered by trees begin here
#Vigna unguiculata- this one is hard because it is a new annotation on the same genome and will cause genome id collisions
echo "vigun.IT97K-499-35.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Vigna/unguiculata/genomes/IT97K-499-35.gnm1.QnBW/vigun.IT97K-499-35.gnm1.QnBW.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            #hack to make this distinct from the version used for ann2; same hack appears below for gff
            sub("gnm1","gnm1.ann1",$1)
            print $1, ".", $1 ~ /Vu[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Vigna \
           --species unguiculata \
           --strain IT97K-499-35 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Vigna/unguiculata/annotations/IT97K-499-35.gnm1.ann1.zb5D/vigun.IT97K-499-35.gnm1.ann1.zb5D.gene_models_main.gff3.gz | zcat | awk 'BEGIN {OFS=FS="\t"} $3=="gene" {sub("gnm1","gnm1.ann1",$1); print}') \
           --gfa https://data.legumeinfo.org/Vigna/unguiculata/annotations/IT97K-499-35.gnm1.ann1.zb5D/vigun.IT97K-499-35.gnm1.ann1.zb5D.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "glyma.Wm82.gnm2.ann1"
wget -O - https://data.legumeinfo.org/Glycine/max/genomes/Wm82.gnm2.DTC4/glyma.Wm82.gnm2.DTC4.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Gm[0-9][0-9]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Glycine \
           --species max \
           --strain Wm82 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Glycine/max/annotations/Wm82.gnm2.ann1.RVB6/glyma.Wm82.gnm2.ann1.RVB6.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Glycine/max/annotations/Wm82.gnm2.ann1.RVB6/glyma.Wm82.gnm2.ann1.RVB6.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "medtr.A17_HM341.gnm4.ann2"
wget -O - https://data.legumeinfo.org/Medicago/truncatula/genomes/A17_HM341.gnm4.2GZ9/medtr.A17_HM341.gnm4.2GZ9.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /chr[1-8]/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Medicago \
           --species truncatula \
           --strain A17_HM341 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Medicago/truncatula/annotations/A17_HM341.gnm4.ann2.G3ZY/medtr.A17_HM341.gnm4.ann2.G3ZY.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Medicago/truncatula/annotations/A17_HM341.gnm4.ann2.G3ZY/medtr.A17_HM341.gnm4.ann2.G3ZY.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "phavu.G19833.gnm1.ann1"
wget -O - https://data.legumeinfo.org/Phaseolus/vulgaris/genomes/G19833.gnm1.zBnF/phavu.G19833.gnm1.zBnF.genome_main.fna.gz.fai |
  awk ' BEGIN { FS=OFS="\t"; print "##gff-version 3" }
        {
            print $1, ".", $1 ~ /Chr[0-9][0-9]$/ ? "chromosome" : "supercontig", 
                   1, $2, ".", ".", ".", "ID=" $1 ";" "Name=" $1 
        }' | 
    python -u -m redis_loader --load-type append gff \
           --genus Phaseolus \
           --species vulgaris \
           --strain G19833 \
           --gene-gff <(wget -O - https://data.legumeinfo.org/Phaseolus/vulgaris/annotations/G19833.gnm1.ann1.pScz/phavu.G19833.gnm1.ann1.pScz.gene_models_main.gff3.gz | zcat | awk 'BEGIN {FS="\t"} $3=="gene" {print}') \
           --gfa https://data.legumeinfo.org/Phaseolus/vulgaris/annotations/G19833.gnm1.ann1.pScz/phavu.G19833.gnm1.ann1.pScz.legfed_v1_0.M65K.gfa.tsv.gz \
           --chromosome-gff /dev/stdin

echo "exit status: $?"
