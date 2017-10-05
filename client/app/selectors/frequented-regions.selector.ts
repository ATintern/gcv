import { MicroTracks } from '../models/micro-tracks.model';

declare var Graph: any;

export const frequentedRegionsSelector = () => {
  return state => state.map(([tracks, params]) => {
      let tracks = Object.assign({}, tracks);
      let frTracks = JSON.parse(JSON.stringify(tracks)),
          grouped  = [],
          results  = [];
      let aggregateSupport = (fr, identified?) => {
        if (identified === undefined) identified = new Set();
        let supporting = fr.supporting.map(n => parseInt(n)).filter((n, i) => {
          return !identified.has(n);
        });
        for (let i = 0; i < supporting.length; i++) {
          identified.add(supporting[i]);
        }
        for (let i = 0; i < fr.descendants.length; i++) {
          supporting = supporting.concat(
            aggregateSupport(fr.descendants[i], identified)
          );
        }
        return supporting;
      }
      let j = 0;
      do {
        results = Graph.frequentedRegions(frTracks, params.alpha, params.kappa,
          params.minsup, params.minsize, {omit: [""]});
        let max   = null,
            maxFR = null;;
        for (let i = 0; i < results.length; i++) {
          if (max == null || results[i]["nodes"].length > max) {
            max   = results[i]["nodes"].length;
            maxFR = results[i];
          }
        }
        if (maxFR != null) {
          console.log("group" + j);
          console.log(maxFR);
          let supporting = aggregateSupport(maxFR),
              group      = [],
              copyTracks = JSON.parse(JSON.stringify(frTracks)).groups;
          for (let i = 0; i < supporting.length; i++) {
            group.push(copyTracks[supporting[i]]);
          }
          for (let i = 0; i < group.length; i++) {
            let gId = "group" + j + ".";
            group[i]["chromosome_name"] = gId.concat(group[i]["chromosome_name"]);
          }
          grouped = grouped.concat(Graph.msa(group));
          frTracks.groups = frTracks.groups.filter(function(t, i) {
            return supporting.indexOf(i) == -1;
          });
        }
        j++;
      } while (results.length > 0);
      tracks.groups = grouped.concat(frTracks.groups);
      return tracks;
    })
};
