var loadedFile='working';

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

function generateMulti(v) {
// select
// add button
// empty UL
  var sel = $("<select class='form-control'>")
    .addClass('multi')
    .data('multi', 'multi' + v.name)
    .attr("id", "sel" + v.name);
  var div = $("<div class='input-group'>")
    .append(sel)
    .append(
      $("<span class='input-group-btn'>")
        .append(
          $("<button class='btn btn-default btn-primary' type='button'>Add</button>")
            .data("field", JSON.stringify(v))
            .data("multi", "multi" + v.name)
            .data("target", "sel" + v.name)
            .attr("id", "mb" + v.name)
            .click(multiButton)
        )
    );
  var opts;
  if(Array.isArray(v.options)) {
    opts = v.options;
  } else {
    opts = localStorage.getItem(v.options);
    if(opts) {
      opts = JSON.parse(opts);
      opts = $.map(opts, function(c,i,a){return c.name;});
    } else {
      opts = [];
    }
  }

  $.each(opts,function(i,opt){
    sel.append( $("<option>").text(opt).val(opt) );
  });

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
  $.each(fields,function(i,v){
    if(v.type == "row") {
      $("#statblockForm").append(generateRow(v.fields,v));
    } else {
      $("#statblockForm").append(generateRow(Array(v),{}));
    }
  });
}

function multiRemoveButton() {
  $(this).remove();
  updateStatblock();
  saveState();
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
  if(field.type == "multi") {
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
  localStorage.setItem("sb_save_" + name, JSON.stringify(state));
  var index = JSON.parse(localStorage.getItem("sb_index"));
  if(!Array.isArray(index)) {
    index = Array();
  }
  if(index.indexOf(name) == -1) {
    index.push(name);
    localStorage.setItem("sb_index", JSON.stringify(index));
    updateMenu();
  }
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
    }
  } else if(state[field.name]) {
    $("#sb" + field.name).val(JSON.parse(state[field.name]));
  }
}

function loadState(name) {
  if(!name) { name="working"; }
  loadedFile = name;
  var state = JSON.parse(localStorage.getItem("sb_save_" + name));
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
    var superquals = localStorage.getItem("sb_superquals");
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
    localStorage.setItem("sb_superquals", JSON.stringify(superquals));
    generateForm();
  }
}

function newFeat() {
  var name = prompt("New feat name?" );
  var description = prompt( "Feat description?" );
  if(name && description) {
    var feats = localStorage.getItem("sb_feats");
    if(!feats) {
      feats = {};
    } else {
      feats = JSON.parse(feats);
    }
    feats[ name ] = {
      name: name,
      description: description
    }
    localStorage.setItem("sb_feats", JSON.stringify(feats));
    generateForm();
  }
}

function updateMenu() {
  var index = JSON.parse(localStorage.getItem("sb_index"));
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
}

$(function(){
  initializeMenu();
  generateForm();
  loadState();
  updateStatblock();
  updateMenu();
});
