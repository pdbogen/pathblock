function updateStatblockValue(v) {
  var val = "";
  if(v.retriever) {
    return v.retriever();
  }

  if(v.type == "multi") {
    val = $.map($("#multi" + v.name + " button").get(), function(but){
      return $(but).data("val");
    }).join(", ");
  } else {
    val = $("#sb" + v.name).val();
  }
  if(v.formatter) {
    return v.formatter(val);
  } else {
    return val;
  }
}

function updateStatblockField(v) {
  var value = updateStatblockValue(v);
  var result;
  if(v.style == "floatLeft") {
    result = $("<div style='float: left'>").text(value);
  } else if(v.style == "right") {
    result = $("<div style='text-align: right;'>").text(value);
  } else if(v.style == "skill") {
    result = $("<span>")
      .append(
        $("<span class='sbSkillLabel'>").text(v.name)
      )
      .append(
        $("<span class='sbValue'>").text(value)
      );
  } else if(v.style == "separator") {
    result = $("<div class='sbSeparator'>").text(v.name);
  } else if(v.type == "descs") {
    var div = $("<div>");
    var store = localStorage.getItem("sb_" + v.name);
    if(store) {
      store = JSON.parse(store);
      var items = $("#multi" + v.target + " button").toArray().map(function(c,i,a){return $(c).data('val');});
      $.each(items,function(i, item){
        var label = $("<span class='sbLabel'>");
        label.text(item);
        if(store[item].type) {
          label.append(document.createTextNode(" (" + store[item].type + ")"));
        }
        label.append(": ");
        div.append(
          $("<div>")
            .append(label)
            .append(store[item].description)
        );
      });
      result = div;
    }
  } else {
    result = $("<span class='sbValue'>");
    if(v.label) { result.append($("<span class='sbLabel'>").text(v.label + " ")); }
    result.append(document.createTextNode(value));
    if(v.postLabel) { result.append($("<span class='sbPostLabel'>").text(v.postLabel)); }
  }
  if(value=="") {
    return "";
  }
  return result;
}

function updateStatblockRow(row,field) {
  var div = $("<div class='col-sm-12'>");
  var tgt = div;
  var content = false;
  if(field.style && field.style == "major") {
    tgt = $("<div class='sbMajorSep'>");
    div.append(tgt);
  }
  if(field.style && field.style == "custom") {
    return field.formatter(row,field,row.map( updateStatblockValue ) );
  } else if(field.style && field.style == "optList") {
    if(field.label) {
      var span = $('<span class="sbLabel">');
      span.text(field.label).append(' ');
      div.append(span);
    }
    $.each(row,function(i,v){
      var res = updateStatblockField(v);
      if(res!="") {
        content=true;
        tgt.append(res);
        if(field.delimiter) { tgt.append(document.createTextNode(field.delimiter)); }
        tgt.append(' ');
      }
    });
    content=true;
  } else {
    $.each(row,function(i,v){
      var res = updateStatblockField(v);
      if(res!="") {
        content=true;
        tgt.append(res);
        if(field.delimiter) { tgt.append(document.createTextNode(field.delimiter)); }
        tgt.append(' ');
      }
    });
  }
  if(content) {
    return div;
  } else {
    return "";
  }
}

function updateStatblock() {
  var block = $("#statblockTarget").empty();
  $.each(fields,function(i,v){
    if(v.type == "row") {
      block.append(updateStatblockRow(v.fields, v));
    } else {
      block.append(updateStatblockRow(Array(v),{}));
    }
  });
}
