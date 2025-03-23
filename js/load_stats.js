function loadStats(){
    tableStats.querySelectorAll("thead tr:first-child th").forEach(th => {
      if (th.innerText){
        th.setAttribute("title", columns_description[th.innerText])
      }
    });


    // tableStats.querySelectorAll("tr").forEach(tr => {
    //   if (tr.parentElement.tagName === "THEAD"){
    //     console.log(tr)
    //     tr.innerHTML = "<th></th>" + tr.innerHTML ;
    //   } else {
    //     player = tr.querySelector("th").innerText ;
    //     tr.innerHTML = `<td><input type="checkbox" value="${player}" onchange="plotSomething()"></td>` + tr.innerHTML
    //   }
    // })
    
    xVariable.innerHTML = ""
    yVariable.innerHTML = ""
    hVariables.innerHTML = ""

    for (k of Object.keys(window.data).sort()){
        if (k === "Jornada"){
            selected = "selected"
        } else {
            selected = ""
        }
        xVariable.innerHTML += `<option value="${k}" ${selected}>${k}</option>`
        yVariable.innerHTML += `<option value="${k}">${k}</option>`
        //hVariables.innerHTML += `<div title="${columns_description[k]}"><input type="checkbox" id="h${k}" name="h${k}" value="${k}" onchange="plotSomething()"><label for="h${k}">${k}</label><div>`
        hVariables.innerHTML += `<div title="${k}"><input type="checkbox" id="h${k}" name="h${k}" value="${k}" onchange="plotSomething()"><label for="h${k}">${k}</label><div>`

    }

    plotSomething()

}

function plotSomething(){
    x = xVariable.selectedOptions[0].value
    y = yVariable.selectedOptions[0].value
    hover_vars = Array.from(hVariables.querySelectorAll("input")).filter(input => input.checked).map(input => input.value)
    checked_players = Array.from(tableStats.querySelectorAll("input")).filter(input => input.checked).map(input => input.value)
    source_data = window.data

    if (checked_players.length){
        source_data = {};

        indices = []
        for (i in window.data.Jugador){
            if (checked_players.indexOf(window.data.Jugador[i]) > -1){
          indices.push(i)
          }
          }

        // Iterate over each key in the dictionary
        for (const [key, array] of Object.entries(window.data)) {
            // Filter the array for the specified indices
            source_data[key] = indices.map(index => array[index]).filter(value => value !== undefined);
        }

    }

    const stats_source = new Bokeh.ColumnDataSource({
        data: source_data
      });
    
    statsPlot.innerHTML = "";

    const plot = Bokeh.Plotting.figure({
        title: '',
        tools: "pan,wheel_zoom,box_zoom,tap,reset,save",
        x_axis_label: x,
        y_axis_label: y,
        height: 1000,
        width: 1000
    });
    scatter = plot.scatter({x: {field: x}, y: {field: y}, size: 25, fill_color: "black", source: stats_source});

    text = plot.text({x: {field: x}, y: {field: y}, text: {field: "Num"}, source: stats_source, text_color: "white", text_align: "center", text_baseline: "middle"})
    var tooltip = "<div style='padding: 2px; border: 1px solid black'>"
    
    for (const hover_var of hover_vars) {
        tooltip = tooltip + "<div>"+hover_var+": @"+hover_var+"</div>"
    }
    
    tooltip = tooltip + "</div>";

    var hover = new Bokeh.HoverTool({
    renderers: [scatter],
    tooltips: tooltip
    });
    if (hover_vars.length){
        plot.add_tools(hover);
    }

    const tap = plot.toolbar.select_one(Bokeh.TapTool)
    tap.renderers = [scatter]
    tap.callback = {
      execute(_obj, { source }) {
        const indices = source.selected.indices
        tableStats.querySelectorAll("tr").forEach(tr => {
            tr.style.backgroundColor = "none"
        })
        for (indice of indices){
            player_name = source.data.Jugador[indice]
            console.log(`Selected material: ${player_name}`)
            tableStats.querySelectorAll("tr").forEach(tr => {
                tr_name = tr.querySelector("th").innerText;
                if (tr_name === player_name){
                    tr.style.backgroundColor = "#ccc"
                }
            })
            source.selected.indices = []
        }
      }
    }

    Bokeh.Plotting.show(plot, "#statsPlot");
}
