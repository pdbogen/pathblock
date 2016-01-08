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

function findSource(fields,name) {
  if(fields[0]) {
    if(fields[0].type == "row") {
      var rowResult = findSource(fields[0].fields, name);
      if(rowResult) {
        return rowResult;
      } else {
        return findSource(fields.slice(1),name);
      }
    } else if(fields[0].name == name) {
      return fields[0];
    } else {
      return findSource(fields.slice(1),name);
    }
  } else {
    return null;
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
    var items = $("#multi" + v.target + " button").toArray().map(function(c,i,a){return $(c).data('val');});
    if(v.source == "fields") {
      store = findSource(fields, v.target);
      if(store) {
        store = store.options;
      } else {
        store = [];
      }
      $.each(items,function(i, item){
        var storeItem = store.filter(function(c,i,a){return c.name == item;})[0];
        if(storeItem) {
          var label = $("<span class='sbLabel'>");
          label.text(storeItem.label || storeItem.name );
          if(storeItem.type) {
            label.append( " (" + storeItem.type + ")" );
          }
          label.append(": ");
          div.append(
            $("<div>")
              .append(label)
              .append(storeItem.description)
          );
        }
      });
      result = div;
    } else {
      var store = localStorage.getItem("sb_" + v.name);
      if(store) {
        store = JSON.parse(store);
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
