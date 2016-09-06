
var boardAuditor = (function(){
  var board = null;
  var boardContent = "#boardContent";

  function init(){
    $("#selectUser").change(function(evt){
      var option;
      for(var i = 0; i<evt.target.length; i++){
        option = evt.target[i];
        if(option.selected == true)
          populateTable(option.value);
      }
    });

    $("#btnReadJSON").click(function(){
      var jsonText = $("#jsonContent").val();
      var objBoard;
      try {
        objBoard = JSON.parse(jsonText);
      } catch (e) {
        console.log(e);
      }
      if (!objBoard) {
        disableAuditing();
      }else{
        board = objBoard;
        populateUserList();
        enableAuditing();
      }
    });
  }
  init();

  function disableAuditing(){
    $(boardContent).addClass("disabled");
  }
  function enableAuditing(){
    $(boardContent).removeClass("disabled");
  }

  function searchMemberById(id){
    for(var i = 0; i < board.members.length; i++){
      if(board.members[i].id == id){
        return board.members[i];
      }
    }
    return false;
  }

  function searchCardById(id){
    for(var i = 0; i < board.cards.length; i++){
      if(board.cards[i].id == id){
        return board.cards[i];
      }
    }
    return false;
  }

  function populateUserList(){
    var tmplOption = "<option value=\"{{id}}\" >{{name}}</option>";
    var listaOption = "<option selected='selected' disabled='disabled'>Select a user</option>";
    for(var i = 0; i < board.members.length; i++){
      listaOption += tmplOption.replace("{{id}}", board.members[i].id).replace("{{name}}", board.members[i].fullName);
    }
    $("#selectUser").html(listaOption);
  }

  function populateTable(userId){

    $("#lista").html("");

    var actionsUser = new Array();

    var tmplLine    = "<tr><td>{{idx}}</td><td>{{date}}</td><td>{{cardName}}</td><td>{{action}}</td></tr>";

    var user = searchMemberById(userId);

    $(board.actions).each(function(idx, el){
      if(el.idMemberCreator == user.id)
        actionsUser.push(el);
    });

    console.log(actionsUser);

    var table = "";
    var lines = new Array();
    $(actionsUser).each(function(idx, el){
      //console.log("idx:", idx, "el:", el);
      var line = tmplLine;
      var data = el.data;

      line = line.replace("{{idx}}", idx);

      var dateTime = new Date(el.date);

      line = line.replace("{{date}}", dateTime.toLocaleString());

      switch(el.type){
        case "updateCard":
          if(data.listAfter !== undefined){
            var txtTmp = "List Change. From \""+data.listBefore.name+"\" to \""+data.listAfter.name+"\"";
            line = line.replace("{{action}}", txtTmp);
          }else{
            return true;
          }
          break;
        case "commentCard":
          line = line.replace("{{action}}", "Comment: \""+data.text+"\"");
          break;
        case "addAttachmentToCard":
          line = line.replace("{{action}}", "Attachment Added: \"<a href=\""+data.attachment.url+"\">"+data.attachment.name+"</a>\"");
          break;
        case "deleteAttachmentFromCard":
          line = line.replace("{{action}}", "Attachment Deleted. \""+data.attachment.name+"\"");
          break;
        case "updateCheckItemStateOnCard":
          line = line.replace("{{action}}", "Check List \""+data.checklist.name+"\"  Updated. Item \""+data.checkItem.name+"\" to state \""+data.checkItem.state+"\"");
          break;
        case "addChecklistToCard":
          line = line.replace("{{action}}", "Added Check List \""+data.checklist.name+"\"" );
          break;
        case "removeChecklistFromCard":
          line = line.replace("{{action}}", "Check List \""+data.checklist.name+"\" removed." );
          break;
        case "addMemberToCard":
          var newMember = searchMemberById(data.idMember);
          line = line.replace("{{action}}", "Added New Member (\""+newMember.fullName+"\") to Card.");
          break;
        case "addMemberToBoard":
          line = line.replace("{{action}}", "Added New Member (\""+el.member.fullName+"\") to Board.");
          break;
        case "createCard":
          line = line.replace("{{action}}", "New Card Created.");
          break;
        case "deleteCard":
          var card = searchCardById(data.card.id);
          if(!card)
            card = { name :"--card not found --" };
          line = line.replace("{{action}}", "Card \""+card.name+"\" deleted.");
          break;
        default:
          line = line.replace("{{action}}", "<strong>The action type \""+el.type+"\" was not expected.</strong>");
          break;
      }


      if(data.card !== undefined ){
        line = line.replace("{{cardName}}", data.card.name);
      }else{
        line = line.replace("{{cardName}}", "");
      }

      lines.push(line);
    });

    $("#lista").html(lines.join(''));

  }

  return {};
});

$(document).ready(function(){
  new boardAuditor();
});
