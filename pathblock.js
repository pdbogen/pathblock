// TODO: Sort SQ and Feat selects

var loadedFile='working';

function checkToken() {
  var token = localStorage.getItem("pathblock_auth_token");
  if(!token || token == "") {
    token = prompt("Please provide an authentication token.");
  } else {
    $("#tokenholder").text(token);
  }
  localStorage.setItem("pathblock_auth_token", token);
}

function getData(n,cb) {
  if(cb === undefined) { console.error( "synchronously retrieving " + n ); }
  var result = $.ajax({
    url: "/api/v1/datum/" + encodeURIComponent(n),
    async: cb!==undefined,
    headers: {
      Authorization: localStorage.getItem("pathblock_auth_token")
    }
  }).done(function(v){
    if(cb) { cb(v) }
  });
  if(cb) return;
  if(result.status == 200) {
    return result.responseText;
  } else {
    if(console && console.error) console.error( "retrieving data failed: " + result.status + " " + result.statusText + ": " + result.responseText );
  }
}

function putData(n,v) {
  var result = $.ajax({
    url: "/api/v1/datum/" + encodeURIComponent(n),
    method: "PUT",
    data: v,
    headers: {
      Authorization: localStorage.getItem("pathblock_auth_token")
    }
  });
}

function generateString(v) {
  return $("<input type='text' class='form-control'>")
    .attr( "placeholder", v.placeholder )
    .attr( "id", "sb" + v.name )
    .data( "target", "val" + v.name )
    .keyup(function(){ updateStatblock(); saveState(); });
}

function generateSelect(v) {
  var sel = $("<select class='form-control'>")
    .attr( "id", "sb" + v.name )
    .data( "target", "val" + v.name )
    .change(function(){ updateStatblock(); saveState(); });
  $.each(v.options,function(i,opt){
    sel.append( $("<option>").text(opt).val(opt) );
  });
  return sel;
}

function generateMultiPrompt(v) {
  var addButton = $("<button class='btn btn-default btn-primary' type='button'>Add New</button>")
    .data("field", JSON.stringify(v))
    .click(multiPromptButton);
  var outer = $("<div>")
    .append(addButton)
    .append($("<div>").attr("id", "multi" + v.name))
    .append($("<input type='hidden'>").attr( "id", "sb" + v.name));
  return outer;
}

function generateMultiOpts(select,optArray) {
  $.each(optArray,function(i,opt){
    if(opt.name) {
      select.append( $("<option>").text(opt.name).val(opt.name) );
    } else {
      select.append( $("<option>").text(opt).val(opt) );
    }
  });
}

function generateMulti(v) {
// select
// add button
// empty UL
  var sel = $("<select class='form-control'>")
    .addClass('multi')
    .data('multi', 'multi' + v.name)
    .attr("id", "sel" + v.name);
  var addButton = $("<button class='btn btn-default btn-primary' type='button'>Add</button>")
    .data("field", JSON.stringify(v))
    .data("multi", "multi" + v.name)
    .data("target", "sel" + v.name)
    .attr("id", "mb" + v.name)
    .click(multiButton);
  var div = $("<div class='input-group'>")
    .append(sel)
    .append($("<span class='input-group-btn'>").append(addButton));
  var opts;

  if(Array.isArray(v.options)) {
    generateMultiOpts(sel,v.options);
  } else {
    getData(v.options,function(value){
      if(value!=="") {
        opts = JSON.parse(value);
        opts = $.map(opts, function(c,i,a){return c.name;});
        generateMultiOpts(sel,opts);
      }
    });
  }

  var outer = $("<div>").append(div);
  outer.append( $("<div>").attr("id", "multi" + v.name) );
  outer.append( $("<input type='hidden'>").attr( "id", "sb" + v.name ) );
  return outer;
}

function generateField(v) {
  var elem = $("<div class='col-sm-9'>");
  var div = $("<div class='row'>");
  if( v.type == "string" ) {
    elem.append(generateString(v));
  } else if( v.type == "select" ) {
    elem.append(generateSelect(v));
  } else if( v.type == "multi" ) {
    elem.append(generateMulti(v));
  } else if(v.type == "multiPrompt") {
    elem.append(generateMultiPrompt(v));
  } else {
    elem = undefined;
  }

  if(elem) {
    var n = v.name;
    if(v.display) n = v.display;
    div.append(
      $("<label class='col-sm-3 control-label'>")
        .text(n)
    );
    div.append(elem);
  }
  return div;
}

function generateRow(fields, elem) {
  var div = $("<div>");
  var tgt = div;
  if(elem.display) {
    tgt = $("<div class='col-sm-11 formSection'>");
    div
      .append(
        $("<div class='row'>")
          .append($("<label class='col-sm-3 control-label'>").text(elem.display))
      )
      .append(
        $("<div class='row'>")
          .append("<div class='col-sm-1'>")
          .append(tgt)
      );
  }
  $.each(fields, function(i,v){ tgt.append(generateField(v)); } );
  return div;
}

function generateForm() {
  $("#statblockForm").empty();
  $.each(fields,function(i,v){
    try {
      if(v.type == "row" || v.type == "listRow") {
        $("#statblockForm").append(generateRow(v.fields,v));
      } else {
        $("#statblockForm").append(generateRow(Array(v),{}));
      }
    } catch(e) {
      alert( "Exception: " + a + " occurred generating form field " + v.name );
    }
  });
}

function multiRemoveButton() {
  $(this).remove();
  updateStatblock();
  saveState();
}

function multiPromptButton(update) {
  if(update===undefined) {
    update=true;
  }
  var field = JSON.parse($(this).data("field"));
  var cache = getData("sb_cache_" + field.name);
  if(!cache) {
    cache = {};
  } else {
    cache = JSON.parse(cache);
  }

  var needSave = 0;
  var params = {};
  $.each( field.parameters, function(i,p) {
    var cached = "";
    if(p.key && params[p.key] && cache[params[p.key]] && cache[params[p.key]][p.name]) {
      cached = cache[params[p.key]][p.name];
    }
    params[p.name] = prompt( "Please provide: " + p.name + "\n" + p.prompt, cached );
    if(p.key && params[p.key] && params[p.name] != cached) {
      var kv = params[p.key];
      if(!cache.hasOwnProperty(kv) || typeof cache[kv] != "object" || Array.isArray(cache[kv])) {
        cache[kv] = {};
      }
      cache[kv][p.name] = params[p.name];
    }
  });
  putData("sb_cache_"+field.name, JSON.stringify(cache));
  addMultiPromptButton(field,params);
  if(update) { updateStatblock(); saveState(); }
}

function addMultiPromptButton(field,params) {
  $("#multi" + field.name).append(
    $("<button class='btn btn-default btn-sm'></button>")
      .text( params["name"] )
      .prop( "id", "multiprompt_" + field.name + "_" + params["name"] )
      .data( "val", JSON.stringify(params) )
      .data( "field", $(this).data("field") )
      .append( "<span class='glyphicon glyphicon-remove'>" )
      .click(multiRemoveButton)
  );
}

function multiButton(update) {
  if(update===undefined) {
    update=true;
  }
  var multi = $(this).data("multi");
  if(multi) {
    var field = JSON.parse($(this).data("field"));
    var target = $("#" + $(this).data("target")).val();
    var exists = $("#" + multi + " button").filter(function(){ return $(this).data("val") == target; }).size();
    if(target && !exists) {
      $("#" + multi)
        .append(
          $("<button class='btn btn-default btn-sm'></button>")
            .text( target + " " )
            .data( "val", target )
            .data( "field", $(this).data("field") )
            .append( "<span class='glyphicon glyphicon-remove'>" )
            .click(multiRemoveButton)
        )
        .append(" ");
    }
    if(update) { updateStatblock(); saveState(); }
  }
}

function saveStateValue(field) {
  var val = "";
  if(field.type == "multi" || field.type == "multiPrompt") {
    val = $.map($("#multi" + field.name + " button").get(), function(but){
      return $(but).data("val");
    });
  } else {
    val = $("#sb" + field.name).val();
  }
  return JSON.stringify(val);
}

function saveState(name) {
  if(!name) { name="working"; }
  var state = {};
  $.each(fields,function(i,v){
    if(v.skip) { return; }
    if(v.type == "row") {
      $.each(v.fields,function(i,v){
        state[v.name] = saveStateValue(v);
      });
    } else {
      state[v.name] = saveStateValue(v);
    }
  });
  putData("sb_save_" + name, JSON.stringify(state));
  getData("sb_index",function(v){
    var index;
    if(v!=="") {
      index = JSON.parse(v);
    }
    if(!Array.isArray(index)) {
      index = Array();
    }
    if(index.indexOf(name) == -1) {
      index.push(name);
      putData("sb_index", JSON.stringify(index));
      updateMenu();
    }
  });
}

function loadStateValue(state,field) {
  if(field.type == "multi") {
    try {
      var opts = JSON.parse(state[field.name]);
      $.each(opts,function(i,v){
        $("#sel" + field.name).val(v);
        multiButton.call( document.getElementById("mb" + field.name), false );
      });
      $("#sel" + field.name).val( $("#sel" + field.name + " option").first().val() );
    } catch(SyntaxError) {
        if(console && console.error) console.error( "error doing something with " + v );
    }
  } else if(field.type == "multiPrompt") {
    var entries = JSON.parse(state[field.name]);
    $.each(entries,function(i,v){
      try {
        addMultiPromptButton(field,JSON.parse(v));
      } catch(SyntaxError) {
        if(console && console.error) console.error( "error parsing JSON: " + v );
      }
    });
  } else if(state[field.name]) {
    $("#sb" + field.name).val(JSON.parse(state[field.name]));
  }
}

function loadState(name) {
  if(!name) { name="working"; }
  loadedFile = name;
  getData("sb_save_" + name, function(value) {
    var state = JSON.parse(value);
    clearState();
    $.each(fields,function(i,v){
      if(v.skip) { return; }
      if(v.type == "row") {
        $.each(v.fields,function(i,v){
          loadStateValue(state, v);
        });
      } else {
        loadStateValue(state, v);
      }
    });
  });
}

function clearState() {
  $('#statblockForm input').val('');
  $('#statblockForm select').each(function(i,e){
    $(e).find('option').first().prop('selected', true);
  });
  $('#statblockForm select.multi').each(function(i,e){
    $('#' + $(e).data('multi')).empty();
  });
}

function initializeMenu() {
  $('#menuSave').click(function(){
    var name = window.prompt("Creature name?", loadedFile);
    if(name) {
      saveState(name);
      loadedFile = name;
    }
  });
  $('#menuNew').click(clearState);
  $('#menuNewSQ').click(newSQ);
  $('#menuNewFeat').click(newFeat);
}

function newSQ() {
  var name = prompt("New Special Quality name? (e.g.: Proficient)");
  var type = prompt("SQ type? (Ex or Su)");
  var description = prompt( "SQ description?" );
  if(name && type && description) {
    getData("sb_superquals", function(superquals) {
      if(!superquals) {
        superquals = {};
      } else {
        superquals = JSON.parse(superquals);
      }
      superquals[ name ] = {
        name: name,
        type: type,
        description: description
      }
      putData("sb_superquals", JSON.stringify(superquals));
      generateForm();
      loadState();
      updateStatblock();
    });
  }
}

function newFeat() {
  var name = prompt("New feat name?" );
  var description = prompt( "Feat description?" );
  if(name && description) {
    getData("sb_feats", function(feats){
      if(!feats) {
        feats = {};
      } else {
        feats = JSON.parse(feats);
      }
      feats[ name ] = {
        name: name,
        description: description
      }
      putData("sb_feats", JSON.stringify(feats));
      generateForm();
      loadState();
      updateStatblock();
    });
  }
}

function updateMenu() {
  getData("sb_index", function(indexdata) {
    var index;
    if(indexdata !== "") {
      index = JSON.parse(indexdata);
    }
    if(Array.isArray(index)) {
      var menu = $('#menuLoad').empty();
      index.map(function(c,i,a){
        menu.append(
          $('<li>')
            .append(
              $('<a>')
                .text(c)
                .prop('href', '#')
                .click(function(){loadState(c);updateStatblock();})
            )
        );
      });
    }
   });
}

$(function(){
  checkToken();
  initializeMenu();
  try {
    generateForm();
  } catch(TypeError) {
    alert( "TypeError occurred while generating form" );
  }
  loadState();
  updateStatblock();
  updateMenu();
});
