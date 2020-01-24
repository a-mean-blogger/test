console.log('hello-world.js');

var HW = function(socket, name, language){
  var WIDTH = 600;
  var MAX_WIDTH = 800;
  var WIDTH_END = 800;
  var HEIGHT = 400;
  var MAX_HEIGHT = 533;
  var KEY_UP = 38;
  var KEY_DOWN = 40;
  var KEY_RIGHT = 39;
  var KEY_LEFT = 37;
  var KEY_SPACE = 32;
  var ROOT_DIR = './';

  var offsetX = 0, offsetY = 0;
  var windowInnerHeight = 0;

  var canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.border = 'black 1px solid';
  canvas.style.width = '100%';
  canvas.style.maxWidth = MAX_WIDTH+'px';
  $('#helloWorld').append(canvas);
  var ctx = canvas.getContext('2d');

  // common
  var common = {
    _T: function (message){
      var translations = {
        'Please rotate your device to landscape mode':{
          'ko': '화면을 가로모드로 돌려주세요'
        },
        'You\'re NOT logged in. your game score will not be saved.':{
          'ko': '현재 로그인되어 있지 않습니다. 게임점수가 저장되지 않습니다.'
        }
      };

      return translations[message][language]?translations[message][language]:message;
    },
    postInfo: function (game,score){
      token = common.getToken();
      if(token&&socket) socket.emit(game,token,score);
    },
    distance: function (A, B, option){
      switch(option){
        case 'x' :
          return Math.sqrt(Math.pow((A.x-B.x),2));
        case 'y' :
          return Math.sqrt(Math.pow((A.y-B.y),2));
        case 'both' :
          return Math.sqrt(Math.pow((A.x-B.x),2)+Math.pow((A.y-B.y),2));
        case 'center' :
          return Math.sqrt(Math.pow((A.x-B.x),2)+Math.pow((A.y-B.y+B.height/2),2));
        default :
          return Math.sqrt(Math.pow((A-B),2));
      }
    },
    dot: function (x,y,color){
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.strokeStyle=color;
      ctx.stroke();
      ctx.restore();
    },
    checkWindowSize: function (){
      var oldHeight = canvas.style.height;
      if((screen.availWidth<MAX_WIDTH||screen.availHeight<MAX_HEIGHT)&&screen.availWidth/screen.availHeight>MAX_WIDTH/MAX_HEIGHT){
        canvas.style.height=screen.availHeight+'px';
        canvas.style.width=screen.availHeight*MAX_WIDTH/MAX_HEIGHT+'px';
      }
      else if((screen.availWidth<MAX_WIDTH||screen.availHeight<MAX_HEIGHT)&&screen.availHeight/screen.availWidth>MAX_HEIGHT/MAX_WIDTH){
        canvas.style.width=screen.availWidth-5+'px';
        canvas.style.height=(screen.availWidth-5)*MAX_HEIGHT/MAX_WIDTH+'px';
      }
      else {
        canvas.style.width=MAX_WIDTH;
        canvas.style.height=MAX_HEIGHT;
      }
      if(windowInnerHeight != window.innerHeight){
        windowInnerHeight = window.innerHeight;
        window.scrollTo(0,$('canvas').offset().top);
      }
    },
    drawBackground: function (bg,isFixed,repeatDir){
      var backgroundPatten = document.createElement('canvas');
      backgroundPatten.width = bg.sWidth;
      backgroundPatten.height = bg.sHeight;
      var pattenCtx=backgroundPatten.getContext('2d');
      pattenCtx.drawImage(bg.spriteSheet,bg.sX,bg.sY,bg.sWidth,bg.sHeight,0,0,bg.sWidth,bg.sHeight);
      var pat = ctx.createPattern(backgroundPatten,'repeat');
      ctx.save();
      ctx.fillStyle = pat;

      var width = bg.width;
      var height = bg.height;
      switch(repeatDir){
        case 'x':
          width+=offsetX;
          break;
        case 'y':
          height+=offsetY;
          break;
      }

      if(isFixed){
        ctx.translate(bg.x, bg.y);
        ctx.fillRect(0-offsetX,0-offsetY,width,height);
      }
      else {
        ctx.translate(bg.x-offsetX, bg.y-offsetY);
        ctx.fillRect(0,0,width,height);
      }
      ctx.restore();
    },
    createImage: function (path){
      var image = new Image();
      image.src = path;
      return image;
    },
    getToken: function (){
      var token = localStorage['mb4.token'];
      if(token) token = token.replace(/"/g,'');

      return token;
    },
  };

  var input = {
    target: 'world',
    enabled: true,
    keyStates: [],
    keyHitStates: [], // keys will be added here once clicked, will be removed once checked by 'checkKeyHit' function.
    checkKeyHit: function (key){
      if(input.keyHitStates[key]){
        delete input.keyHitStates[key];
        return true;
      }
      return false;
    },
    eventHandlers:{
      keydown: function (e){
        $('#output').html('keydown');
        e.preventDefault();
        if(!input.keyStates[e.keyCode]) input.keyHitStates[e.keyCode] = true;
        if(input.enabled) input.keyStates[e.keyCode] = true;
      },
      keyup: function (e){
        $('#output').html('keyup');
        e.preventDefault();
        delete input.keyStates[e.keyCode];
      },
      click: function(e){
        $('#output').html('click');
        input.mouse.update(e.layerX, e.layerY);
      },
      touchstart: function(e){
        $('#output').html('touchstart');
        var touch = input.touch;

        e.preventDefault();

        touch.touched = true;
        var time = new Date();
        var offset = $('canvas').offset();
        touch.startTime = time.getTime();
        var touchobj = e.changedTouches[0];
        touch.startX = parseInt(touchobj.pageX)-offset.left;
        touch.startY = parseInt(touchobj.pageY)-offset.top;
        touch.endX = parseInt(touchobj.pageX)-offset.left;
        touch.endY = parseInt(touchobj.pageY)-offset.top;
      },
      touchmove: function(e){
        $('#output').html('touchmove');
        var touch = input.touch;

        var offset = $('canvas').offset();
        var touchobj = e.changedTouches[0];
        touch.endX = parseInt(touchobj.pageX)-offset.left;
        touch.endY = parseInt(touchobj.pageY)-offset.top;
      },
      touchend: function(e){
        $('#output').html('touchend');
        var touch = input.touch;

        var time = new Date();
        touch.endTime = time.getTime();
        if(touch.endTime-touch.startTime<500 && Math.abs(touch.endY-touch.startY)<10 && Math.abs(touch.endX-touch.startX<10)){
          input.mouse.update(touch.endX,touch.endY);
        }
        touch.status = false;
        touch.startX = null;
        touch.startY = null;
      },
    },
    init: function(){
      document.addEventListener('keydown', this.eventHandlers.keydown);
      document.addEventListener('keyup', this.eventHandlers.keyup);
      document.getElementById('helloWorld').addEventListener('click',this.eventHandlers.click);
      canvas.addEventListener('touchstart',this.eventHandlers.touchstart);
      canvas.addEventListener('touchmove',this.eventHandlers.touchmove);
      canvas.addEventListener('touchend',this.eventHandlers.touchend);
    },
    destroy: function(){
      document.removeEventListener('keydown', this.eventHandlers.keydown);
      document.removeEventListener('keyup', this.eventHandlers.keyup);
      document.getElementById('helloWorld').removeEventListener('click',this.eventHandlers.click);
      canvas.removeEventListener('touchstart',this.eventHandlers.touchstart);
      canvas.removeEventListener('touchmove',this.eventHandlers.touchmove);
      canvas.removeEventListener('touchend',this.eventHandlers.touchend);
    },
    mouse: {
      clicked: false,
      x: undefined,
      y: undefined,
      update: function(x,y){
        this.x = WIDTH * x/(canvas.offsetWidth);
        this.y = HEIGHT * y/(canvas.offsetHeight);
        if(input.enabled&&this.x<WIDTH&&this.x>0&&this.y>0&&this.y<HEIGHT) {
          this.clicked=true;
        }
      }
    },
    unclick: function(){
      this.mouse.clicked = false;
    },
    checkClicked: function(targetObj,option,distance){
      if(this.mouse.clicked && (!targetObj || (targetObj && common.distance(input.mouse,targetObj,option)<distance))){
        this.mouse.clicked = false;
        return true;
      }
      else {
        return false;
      }
    },
    checkRectClicked: function(x,y,width,height){
      if(this.mouse.clicked && this.mouse.x>x && this.mouse.y>y && this.mouse.x<x+width && this.mouse.y<y+height){
        this.mouse.clicked = false;
        return true;
      }
    },
    touch: {
      touched:false,
      startTime:undefined,
      startX:undefined,
      startY:undefined,
      endTime:undefined,
      endX:undefined,
      endY:undefined
    },
  };

  var mainMessage = {
    x : 50,
    y : 285,
    outputText : null,
    line : 0,
    count : 0,
    makeOutputText : function(string){
      this.outputText = [];
      this.line = -1;
      var offset = 0;
      do{
        this.line++;
        this.outputText[this.line] = '';
        for(var i = 0 ; i<50 ; i++){
          if(!string[i+offset]) break;
          this.outputText[this.line] += string[i+offset];
        }
        offset+=50;
      }
      while(string[offset] !== undefined);
    },
    draw : function(){
      this.count--;

      var stringX = this.x;
      var stringY = this.y;
      ctx.save();
      ctx.fillStyle='rgb(100,100,100)';
      ctx.font = '20px Arial';
      for(var i=0;i<=this.line;i++){
        ctx.fillText(this.outputText[i], stringX, stringY);
        stringY+=25;
      }
      ctx.restore();
    },
    clear:function(){
      this.count = 0;
    }
  };

  var Thing = function(src,x,y,imgWidth,imgHeight,status,height){
    this.abX = x;
    this.abY = y;
    this.x = x;
    this.y = y;
    this.height= height;
    this.imgX0 = this.x-imgWidth/2;
    this.imgY0 = this.y-imgHeight;
    this.imgWidth = imgWidth;
    this.imgHeight = imgHeight;
    this.status = status;
    this.isClicked = false;
    this.readyToStand = true;
    this.img = src?common.createImage(src):null;
    this.drawData ={ count: 0, COUNT_MAX: 30, frameTotNum: 2, frameCount: 1, frame :{}};
    this.drawData.count = Math.floor((Math.random() * 30) + 1);
    this.messageData = {count: 0, num: -1,repeat: 0};
    this.attention = 'north';
  };
  Thing.prototype.update = function(){
    this.x = this.abX - offsetX;
    this.y = this.abY - offsetY;
    if(input.target=='world' && common.distance(player.x,this.x)<40 && (input.checkKeyHit(KEY_SPACE)||input.checkClicked(this,'center',40))){
      player.forcedWalking = true;
      input.enabled = false;
      this.isClicked = true;
    }
    if(this.isClicked){
      if(this.getCloser()) this.action();
    }
  };
  Thing.prototype.getCloser = function(){

    if(player.x>this.x+2){
      player.walk('left');
      return false;
    }
    else if(player.x<this.x-2){
      player.walk('right');
      return false;
    }
    else{
      input.enabled=true;
      player.lookingAt=this.attention;
      this.isClicked=false;
      player.forcedWalking = false;
      return true;
    }
  };
  Thing.prototype.action = function(){
  };
  Thing.prototype.talk = function(){
    if(this.messageData.num<this.messageData.string.length-1){
      this.messageData.num++;
    }
    else {
      this.messageData.num = this.messageData.repeat;
    }
    this.messageData.count=this.messageData.time[this.messageData.num];
  };
  Thing.prototype.mainMessage = function(){
    if(this.messageData.num<this.messageData.string.length-1){
      this.messageData.num++;
    }
    else {
      this.messageData.num = this.messageData.repeat;
    }
    mainMessage.count=this.messageData.time[this.messageData.num];
    mainMessage.makeOutputText(this.messageData.string[this.messageData.num]);
  };
  Thing.prototype.drawTalk = function(){
    var string = this.messageData.string[this.messageData.num];
    var text = [];
    var line = -1;
    var offset = 0;
    if (this.messageData.count>0) {
      this.messageData.count--;
      do{
        line++;
        text[line] = '';
        for(var i = 0 ; i<30 ; i++){
          if(!string[i+offset]) break;
          text[line] += string[i+offset];
        }
        offset+=30;
      }
      while(string[offset] !== undefined);

      var boxWidth = text[0].length*10+20;
      var boxHeight = line*25+40;
      var boxX = this.x-boxWidth/2;
      var boxY = this.y-80-boxHeight;
      var stringX = boxX+10;
      var stringY = boxY+25;
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX,boxY,boxWidth,boxHeight);
      ctx.closePath();
      ctx.fillStyle='rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.strokeStyle='#000';
      ctx.stroke();
      ctx.fillStyle='rgb(222,135,52)';
      ctx.font = '20px Arial';
      for(var i=0; i<=line; i++){
        ctx.fillText(text[i], stringX, stringY);
        stringY+=25;
      }
      ctx.restore();
    }
  };
  Thing.prototype.draw = function(){
    this.imgX0 = this.x-this.imgWidth/2;
    this.imgY0 = this.y-this.imgHeight;

    this.standing();
    if(this.drawData.count-- <0){
      this.drawData.count = this.drawData.COUNT_MAX;
      if(this.drawData.frameCount<this.drawData.frameTotNum) this.drawData.frameCount++;
      else this.drawData.frameCount=1;
    }
    if(this.drawData.frame[this.drawData.frameCount]!==undefined)

    ctx.drawImage(this.img,this.drawData.frame[this.drawData.frameCount].x,this.drawData.frame[this.drawData.frameCount].y,this.imgWidth,this.imgHeight,this.imgX0,this.imgY0,this.imgWidth,this.imgHeight);
  };
  Thing.prototype.standing = function(){
    this.drawData.frameTotNum = 2; // num of frame;
    this.drawData.frame[1] = {x: 0, y: 0};
    this.drawData.frame[2] = {x: 100, y: 0};
  };

  var thingObj = new Thing();

  var Human = function(src,x,y,imgWidth,imgHeight,status,lookingAt,height){
    Thing.call(this,src,x,y,imgWidth,imgHeight,status,height);
    this.lookingAt = lookingAt;
  };
  Human.prototype = Object.create(Thing.prototype);
  Human.prototype.constructor = Human;

  Human.prototype.draw = function(){
    this.imgX0 = this.x-this.imgWidth/2;
    this.imgY0 = this.y-this.imgHeight;

    switch(this.status){
      case 'walking':
        this.walking();
        break;
      case 'sittingOnChair':
        this.sittingOnChair();
        break;
      default:
        this.standing();
    }

    if(this.drawData.count-- <0){
      this.drawData.count = this.drawData.COUNT_MAX;
      if(this.drawData.frameCount<this.drawData.frameTotNum) this.drawData.frameCount++;
      else this.drawData.frameCount=1;
    }
    ctx.drawImage(this.img,this.drawData.frame[this.drawData.frameCount].x,this.drawData.frame[this.drawData.frameCount].y,this.imgWidth,this.imgHeight,this.imgX0,this.imgY0,this.imgWidth,this.imgHeight);
  };
  Human.prototype.standing = function(){
    this.drawData.frameTotNum = 2; // num of frame;
    switch(this.lookingAt){
      case 'right':
        this.drawData.frame[1] = {x: 0, y: 0};
        this.drawData.frame[2] = {x: 100, y: 0};
        break;
      case 'left':
        this.drawData.frame[1] = {x: 200, y: 0};
        this.drawData.frame[2] = {x: 300, y: 0};
        break;
      case 'north':
        this.drawData.frame[1] = {x: 0, y: 300};
        this.drawData.frame[2] = {x: 100, y: 300};
        break;
    }
  };
  Human.prototype.walk= function(toward){
    if(this.status!='walking') this.drawData.count=0;
    this.status='walking';
    this.readyToStand=true;
    this.lookingAt=toward;

    switch(toward){
      case 'right':
        player.x+=2;
        break;
      case 'left':
        player.x-=2;
        break;
    }
  };
  Human.prototype.walking = function(){
    this.drawData.frameTotNum = 2; // num of frame;
    switch(this.lookingAt){
      case 'right':
        this.drawData.frame[1] = {x: 0, y: 100};
        this.drawData.frame[2] = {x: 100, y: 100};
        break;
      case 'left':
        this.drawData.frame[1] = {x: 200, y: 100};
        this.drawData.frame[2] = {x: 300, y: 100};
        break;
    }
  };

  Human.prototype.sitOnChair = function(x,y,lookingAt){
    this.drawData.count=0;
    if(this.status=='sittingOnChair'){
      this.readyToStand=true;
    }
    else{
      this.status='sittingOnChair';
      this.x=x;
      this.y=y;
      this.lookingAt=lookingAt;
      this.readyToStand=false;
    }
  };
  Human.prototype.sittingOnChair = function(){
    this.drawData.frameTotNum = 2; // num of frame;
    switch(this.lookingAt){
      case 'right':
        this.drawData.frame[1] = {x: 0, y: 200};
        this.drawData.frame[2] = {x: 100, y: 200};
        break;
      case 'left':
        this.drawData.frame[1] = {x: 200, y: 200};
        this.drawData.frame[2] = {x: 300, y: 200};
        break;
    }
  };

  var player = new Human(ROOT_DIR+'src/player.png',100,250,98,98,'standing','right',65);
  player.forcedWalking = false;
  player.update = function(){
    if(input.target == 'world' && input.keyStates[KEY_RIGHT]){
      player.walk('right');
      input.unclick();
      input.checkKeyHit(KEY_SPACE);
    }
    if(input.target == 'world' && input.keyStates[KEY_LEFT]){
      player.walk('left');
      input.unclick();
      input.checkKeyHit(KEY_SPACE);
    }

    if(input.target == 'world' && input.mouse.clicked){
      this.forcedWalking = true;
      if(input.mouse.y<280&&input.mouse.y>100){
        if(player.x<input.mouse.x){
          player.walk('right');
          input.checkKeyHit(KEY_SPACE);
        }
        if(player.x>input.mouse.x){
          player.walk('left');
          input.checkKeyHit(KEY_SPACE);
        }
        if(common.distance(player,input.mouse, 'x')<2){
          input.unclick();
          this.forcedWalking = false;
        }
      }
      else {
        input.unclick();
        this.forcedWalking = false;
      }
    }

    if(player.x>WIDTH-200 && WIDTH+offsetX<WIDTH_END){
      offsetX++;
      player.x--;
      input.mouse.x--;
    }
    if(player.x>WIDTH-20) player.x--;
    if(player.x<200 && offsetX>0){
      offsetX--;
      player.x++;
      input.mouse.x++;
    }
    if(player.x<20) player.x++;
    if(player.readyToStand === true){
      if(input.keyStates[KEY_LEFT] === undefined && input.keyStates[KEY_RIGHT] === undefined && this.forcedWalking === false) player.status='standing';
    }
  };

  var Table1 = function(src,x,y,imgWidth,imgHeight,status,height){
    Thing.call(this,src,x,y,imgWidth,imgHeight,status,height);
    this.leftChair = { x: this.x-61, y: this.y, occupied:false};
    this.rightChair = { x: this.x+61, y: this.y, occupied:false};
    this.attention='north';
  };
  Table1.prototype = Object.create(Thing.prototype);
  Table1.prototype.constructor = Thing;

  Table1.prototype.update = function(){
    thingObj.update.call(this);
    this.leftChair.x=this.x-61;
    this.leftChair.y=this.y;
    this.rightChair.x=this.x+61;
    this.rightChair.y=this.y;
    if(!this.leftChair.occupied && input.target=='world' && common.distance(player,this.leftChair,'both')< 20 && (input.checkKeyHit(KEY_SPACE)||input.checkClicked(this.leftChair,'x',20))){
      player.sitOnChair(this.x-55,player.y, 'right');
      player.forcedWalking = false;
    }
    if(!this.rightChair.occupied && input.target=='world' && common.distance(player,this.rightChair,'both')< 20 && (input.checkKeyHit(KEY_SPACE)||input.checkClicked(this.rightChair,'x',20))){
      player.sitOnChair(this.x+55,player.y, 'left');
      player.forcedWalking = false;
    }
  };
  var table1 = new Table1(ROOT_DIR+'src/things.png',233,250,198,98,null,70);
  table1.rightChair.occupied=true;
  table1.standing = function(){
    this.drawData.frameTotNum = 1;
    this.drawData.frame[1] = {x: 0, y: 0};
  };
  table1.action = function(){
    this.mainMessage();
  };
  table1.messageData.time = [100,100];
  table1.messageData.string = ['There is a yellow flower on the table.', 'What kind of flower is it?'];

  var refrigerator = new Thing(ROOT_DIR+'src/things.png',370,250,98,98,null,90);
  refrigerator.standing = function(){
    this.drawData.frameTotNum = 1;
    this.drawData.frame[1] = {x: 200, y: 0};
  };
  refrigerator.action = function(){
    this.mainMessage();
  };
  refrigerator.messageData.time = [150];
  refrigerator.messageData.string = ['A note on the refrigerator : "do not open someone else\'s refrigerator, that\'s rude."'];

  var cat = new Thing(ROOT_DIR+'src/things.png',370,166,98,98,null,30);
  cat.standing = function(){
    this.drawData.frameTotNum = 2;
    this.drawData.frame[1] = {x: 0, y: 100};
    this.drawData.frame[2] = {x: 100, y: 100};
  };
  cat.action = function(){
    this.mainMessage();
  };
  cat.messageData.repeat = 4;
  cat.messageData.time = [100,100,120,120,100,100];
  cat.messageData.string = ['A cat is sleeping..','Let\'s not wake him up.','...Becuase I don\'t want to draw the animaitons..','...What did I just say?','A cat is sleeping..','Let\'s not wake him up.'];

  var photoframe01 = new Thing(ROOT_DIR+'src/things.png',713,191,98,98,null,45);
  photoframe01.standing = function(){
    this.drawData.frameTotNum = 1;
    this.drawData.frame[1] = {x: 200, y: 100};
  };
  photoframe01.action = function(){
    this.mainMessage();
  };
  photoframe01.messageData.time = [100,100];
  photoframe01.messageData.string = ['There are some happy pictures on the wall.','Who are they?'];

  var photoframe02 = new Thing(ROOT_DIR+'src/things.png',700,143,98,98,null,60);
  photoframe02.standing = function(){
    this.drawData.frameTotNum = 1;
    this.drawData.frame[1] = {x: 300, y: 0};
  };
  photoframe02.action = function(){
    photoframe01.mainMessage();
  };

  var photoframe03 = new Thing(ROOT_DIR+'src/things.png',770,160,98,98,null,75);
  photoframe03.standing = function(){
    this.drawData.frameTotNum = 1;
    this.drawData.frame[1] = {x: 300, y: 100};
  };
  photoframe03.action = function(){
    photoframe01.mainMessage();
  };

  var window01 = new Thing(ROOT_DIR+'src/things.png',230,250,198,198,null);
  window01.standing = function(){
    this.drawData.frameTotNum = 2;
    this.drawData.frame[1] = {x: 0, y: 200};
    this.drawData.frame[2] = {x: 200, y: 200};
  };
  window01.attention=player.lookingAt;
  window01.update = function(){
    this.x = this.abX - offsetX;
    this.y = this.abY - offsetY;
  };

  var girl1 = new Thing(ROOT_DIR+'src/things.png',288,250,98,98,null,70);
  girl1.attention = 'right';
  girl1.standing = function(){
    this.drawData.frameTotNum = 2;
    this.drawData.frame[1] = {x: 0, y: 400};
    this.drawData.frame[2] = {x: 100, y: 400};
  };
  girl1.update = function(){
    this.x = this.abX - offsetX;
    this.y = this.abY - offsetY;
    if(input.target=='world' && common.distance(player.x,this.x)<40 && (input.checkKeyHit(KEY_SPACE)||input.checkClicked(this,'center',40))){
      player.forcedWalking = true;
      input.enabled = false;
      this.isClicked = true;
    }
    if(this.isClicked){
      if(this.getCloser()) this.action();
    }
    this.drawTalk();
  };
  girl1.getCloser = function(){
    if(player.x>this.x-38){
      player.walk('left');
      return false;
    }
    else if(player.x<this.x-42){
      player.walk('right');
      return false;
    }
    else{
      input.enabled = true;
      player.lookingAt = 'right';
      this.isClicked = false;
      player.forcedWalking = false;
      return true;
    }
  };
  girl1.action = function(){
    this.talk();
  };
  girl1.messageData.repeat = 1;
  girl1.messageData.time = [100,200,200];
  girl1.messageData.string = ['Hello, '+name+'! How are you?','The arcade is over there, you can play \'WHAC A MOLE\' and \'BUBBLE\'.','Just in case you are curious  what I\'m drinking, It\'s a strawberry smoothie.'];
  if(!name){
    girl1.messageData.time[0] = 300;
    girl1.messageData.string[0] = 'Hi there! Oh you are not logged in. You can still play games but your score will not be saved.';
  }

  var screenArrowLeft = new Thing(ROOT_DIR+'src/things.png',40,250,48,98,null);
  screenArrowLeft.standing = function(){
    this.drawData.frameTotNum = 2;
    this.drawData.frame[1] = {x: 200, y: 400};
    this.drawData.frame[2] = {x: 300, y: 400};
  };
  screenArrowLeft.attention=null;
  screenArrowLeft.update = function(){
    screenArrowLeft.drawData.count=(player.drawData.count+10)%30-1;
  };
  var screenArrowRight = new Thing(ROOT_DIR+'src/things.png',560,250,48,98,null);
  screenArrowRight.standing = function(){
    this.drawData.frameTotNum = 2;
    this.drawData.frame[1] = {x: 250, y: 400};
    this.drawData.frame[2] = {x: 350, y: 400};
  };
  screenArrowRight.attention=null;
  screenArrowRight.update = function(){
    screenArrowRight.drawData.count=(player.drawData.count+10)%30-1;
  };

  var bubble={
    status: false,
    spriteSheet: common.createImage(ROOT_DIR+'bubble/bubble.png'),
    backgroundSheet: common.createImage(ROOT_DIR+'bubble/background.png'),
    gameMode:undefined,
    angleOriginal: undefined,
    angleTouchOffset: undefined,
    turnCount: undefined,
    numOfColumn: undefined,
    bubbleData: undefined,
    GRAVITY:0.25,
    s:false,
    TargetPosition: {xPos:undefined, yPos:undefined, distance:undefined},
    powerOn: function(){
      mainMessage.clear();
      input.target = 'bubble';
      this.gameMode = 'demoMode';
      this.gameOver.status = false;
      this.numOfColumn = null;
      this.bubbleData = null;
      this.status = true;
      this.menuGene('main');
    },
    powerOff: function(){
      input.target = 'world';
      this.status = false;
    },
    menu:{
      status:false,
      instruction: undefined,
      background: undefined,
      textAlign: undefined,
      instruction:{
        status:undefined,
        x:20,
        y:110,
        sX:282,
        sY:84,
        width:210,
        height:214,

        gameFrame: { x:230, y:346, sX:10, sY:84, width:148, height:12 },
        luncher: { x:230, y:278, sX:290, sY:482, width:148, height:68 },
        player: {
          score: undefined,
          arrow: { angle: 0, x:296, y:265, sX:216, sY:482, width:16, height:80 },
          borderLeft: 77,
          curBubble:{ isShow:true, num:1, x:304, y:308 },
          nextBubble:{ num:2, x:269, y:330 },
          thirdBubble:{ num:2, x:230, y:330 }
        },
        bubbleData: undefined,
      },
      title: {
        status:undefined,
        x:162,
        y:20,
        sX:0,
        sY:0,
        width:288,
        height:80
      }
    },
    menuGene: function(options) {
      this.menu.status = true;
      this.bubbleMove.status = false;
      this.menu.instruction.player.curBubble.num = this.bubbleGenerator();
      this.menu.instruction.player.nextBubble.num = this.bubbleGenerator();
      this.menu.instruction.player.thirdBubble.num = this.bubbleGenerator();
      this.menu.instruction.player.arrow.angle = 0;
      switch(options){
        case 'main':
          this.menu.background = true;
          this.menu.title.status = true;
          this.menu.instruction.status = true;
          this.gameMode='demoMode';
          this.menu.instruction.player.curBubble.isShow=true;
          this.menu.textAlign = 'left';
          this.menu[1] = {status: true, x:390, y:165, width:180, height:25, string:'SINGLE PLAY'}; //siglePlay
          this.menu[2] = {status: true, x:390, y:255, width:180, height:25, string:'BATTLE MODE'}; //battleMode
          this.menu[3] = {status: true, x:390, y:210, width:180, height:25, string:'RANKS(SINGLE)'}; //ranks
          this.menu[4] = {status: true, x:390, y:300, width:80, height:25, string:'EXIT'}; //exit
          this.menu[5] = {status: false}; //main menu
          break;
        case 'battleMode':
          this.menu.background = false;
          this.menu.title.status = false;
          this.menu.instruction.status = false;
          this.menu.textAlign = 'center';
          this.menu[1] = {status: false}; //siglePlay
          this.menu[2] = {status: true, x:300, y:220, width:180, height:20, string:'PLAY AGAIN'}; //battleMode
          this.menu[3] = {status: false};//ranks
          this.menu[4] = {status: false};//exit
          this.menu[5] = {status: true, x:300, y:265, width:150, height:20, string:'MAIN MENU'}; //main menu
          break;
        case 'singleMode':
          this.menu.background = false;
          this.menu.title.status = false;
          this.menu.instruction.status = false;
          this.menu.textAlign = 'center';
          this.menu[1] = {status: true, x:300, y:220, width:180, height:20, string:'PLAY AGAIN'}; //siglePlay
          this.menu[2] = {status: false};//battleMode
          this.menu[3] = {status: true, x:300, y:265, width:150, height:20, string:'RANKS'};//ranks
          this.menu[4] = {status: false};//exit
          this.menu[5] = {status: true, x:300, y:310, width:150, height:20, string:'MAIN MENU'}; //main menu
          break;
        case 'exitSingle':
          this.menu.background = false;
          this.menu.title.status = false;
          this.menu.instruction.status = false;
          this.menu.textAlign = 'center';
          this.gameMode = 'demoMode';
          this.menu[1] = {status: false}; //siglePlay
          this.menu[2] = {status: false};//battleMode
          this.menu[3] = {status: false};//ranks
          this.menu[4] = {status: false};//exit
          this.menu[5] = {status: true, x:380, y:325, width:50, height:25, string:'EXIT'}; //main menu
          break;
        case 'exitBattle':
          this.menu.background = false;
          this.menu.title.status = false;
          this.menu.instruction.status = false;
          this.menu.textAlign = 'center';
          this.gameMode = 'demoMode';
          this.menu[1] = {status: false}; //siglePlay
          this.menu[2] = {status: false};//battleMode
          this.menu[3] = {status: false};//ranks
          this.menu[4] = {status: false};//exit
          this.menu[5] = {status: true, x:567, y:325, width:50, height:25, string:'EXIT'}; //main menu
          break;
      }
    },
    menuUpdate: function(){
      for(var i=1; i<=5; i++){
        if(this.menu[i].status){
          var textAlignOffset=0;
          if(this.menu.textAlign =='center'){
            textAlignOffset=-this.menu[i].width/2;
          }
          if(input.checkRectClicked(this.menu[i].x+textAlignOffset,this.menu[i].y-this.menu[i].height,this.menu[i].width,this.menu[i].height)){
            if(!this.single.status || i != 3){
              this.battle.status = false;
              this.single.status = false;
            }
            switch(i){
              case 1: //siglePlay
                this.menuGene('exitSingle');
                this.singleGene();
                break;
              case 2: //battleMode
                this.menuGene('exitBattle');
                this.battleGene();
                break;
              case 3: //ranks
                this.rankGene();
                break;
              case 4: //Game exit
                this.powerOff();
                break;
              case 5: //Game exit
                this.gameOver.status = false;
                this.obstacleBubbleReset();
                this.bubbleFallingReset();
                this.menuGene('main');
              break;
            }
          }
        }
      }
      if(this.menu.instruction.status == true){
        this.control(this.menu.instruction.player);
      }
    },
    menuDraw: function(){
      ctx.save();
      if(this.menu.background){
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0,0,WIDTH,HEIGHT);
      }
      if(this.menu.title.status){
        ctx.drawImage(this.spriteSheet, this.menu.title.sX, this.menu.title.sY, this.menu.title.width, this.menu.title.height, this.menu.title.x, this.menu.title.y, this.menu.title.width, this.menu.title.height);
      }
      if(this.menu.instruction.status){
        ctx.drawImage(this.spriteSheet, this.menu.instruction.sX, this.menu.instruction.sY, this.menu.instruction.width, this.menu.instruction.height, this.menu.instruction.x, this.menu.instruction.y, this.menu.instruction.width, this.menu.instruction.height);
        ctx.drawImage(this.spriteSheet, this.menu.instruction.gameFrame.sX, this.menu.instruction.gameFrame.sY, this.menu.instruction.gameFrame.width, this.menu.instruction.gameFrame.height, this.menu.instruction.gameFrame.x, this.menu.instruction.gameFrame.y, this.menu.instruction.gameFrame.width, this.menu.instruction.gameFrame.height);
        ctx.drawImage(this.spriteSheet, this.menu.instruction.luncher.sX, this.menu.instruction.luncher.sY, this.menu.instruction.luncher.width, this.menu.instruction.luncher.height, this.menu.instruction.luncher.x, this.menu.instruction.luncher.y, this.menu.instruction.luncher.width, this.menu.instruction.luncher.height);
        ctx.translate(this.menu.instruction.player.arrow.x+8,this.menu.instruction.player.arrow.y+44);
        ctx.rotate(this.menu.instruction.player.arrow.angle*Math.PI/180);
        ctx.drawImage(this.spriteSheet, this.menu.instruction.player.arrow.sX, this.menu.instruction.player.arrow.sY, this.menu.instruction.player.arrow.width, this.menu.instruction.player.arrow.height, -8, -44, this.menu.instruction.player.arrow.width, this.menu.instruction.player.arrow.height);
        ctx.restore();
        if(this.menu.instruction.player.curBubble.isShow) {
          ctx.drawImage(this.spriteSheet, this.bubbles[this.menu.instruction.player.curBubble.num].sX, this.bubbles[this.menu.instruction.player.curBubble.num].sY, this.bubbles.width, this.bubbles.height, this.menu.instruction.player.curBubble.x-16, this.menu.instruction.player.curBubble.y-16, this.bubbles.width, this.bubbles.height);
        }
        ctx.drawImage(this.spriteSheet, this.bubbles[this.menu.instruction.player.nextBubble.num].sX, this.bubbles[this.menu.instruction.player.nextBubble.num].sY, this.bubbles.width, this.bubbles.height, this.menu.instruction.player.nextBubble.x-16, this.menu.instruction.player.nextBubble.y-16, this.bubbles.width, this.bubbles.height);
        ctx.drawImage(this.spriteSheet, this.bubbles[this.menu.instruction.player.thirdBubble.num].sX+16, this.bubbles[this.menu.instruction.player.thirdBubble.num].sY, this.bubbles.width-16, this.bubbles.height, this.menu.instruction.player.thirdBubble.x-16+16, this.menu.instruction.player.thirdBubble.y-16, this.bubbles.width-16, this.bubbles.height);
      }
      ctx.fillStyle='rgb(255,255,255)';
      ctx.strokeStyle='rgb(0,0,0)';
      ctx.lineWidth=5;
      for(var i = 1; i<= 5; i++){
        if(this.menu[i].status){
          ctx.textAlign=this.menu.textAlign;
          ctx.font = this.menu[i].height+'px Arial';
          ctx.strokeText(this.menu[i].string, this.menu[i].x, this.menu[i].y);
          ctx.fillText(this.menu[i].string, this.menu[i].x, this.menu[i].y);
        }
      }
      ctx.restore();
    },
    bubbles: { // 1, 4, 7, 10, 13 bubbles are not used on current version
      numberOfColor:4, width:32, height:32,
      0:{color: 0, sX:0, sY:482, special:null},
      // 1:{color: 0, sX:0, sY:518, special:'bomb'},
      2:{color: 0, sX:0, sY:554, special:'colorChange'},
      3:{color: 1, sX:36, sY:482, special:null},
      // 4:{color: 1, sX:36, sY:518, special:'bomb'},
      5:{color: 1, sX:36, sY:554, special:'colorChange'},
      6:{color: 2, sX:72, sY:482, special:null},
      // 7:{color: 2, sX:72, sY:518, special:'bomb'},
      8:{color: 2, sX:72, sY:554, special:'colorChange'},
      9:{color: 3, sX:108, sY:482, special:null},
      // 10:{color: 3, sX:108, sY:518, special:'bomb'},
      11:{color: 3, sX:108, sY:554, special:'colorChange'},
      12:{color: 4, sX:144, sY:482, special:null},
      // 13:{color: 4, sX:144, sY:518, special:'bomb'},
      14:{color: 4, sX:144, sY:554, special:'colorChange'},
      15:{color: 5, sX:180, sY:482, special:null},
      16:{color: 5, sX:180, sY:518, special:'bomb'},
      17:{color: 5, sX:180, sY:554, special:'colorChange'},
      99:{color: 99, sX:0, sY:590, special:'obstacle'},
    },
    single: {
      status:false,
      background: {
        num: undefined,
        maxNum: 1,
        0:{ x:76, y:15, sX:35, sY:0, width:128, height:186 }
      },
      gameFrame: { x:64, y:3, sX:0, sY:84, width:280, height:394 },
      luncher: { x:76, y:317, sX:236, sY:482, width:256, height:68 },
      player: {
        score: undefined,
        arrow: { angle: 0, x:196, y:304, sX:216, sY:482, width:16, height:80 },
        borderLeft: 77,
        curBubble:{ isShow:true, num:undefined, x:204, y:347 },
        nextBubble:{ num:undefined, x:169, y:369 },
        thirdBubble:{ num:2, x:130, y:369 }
      },
      bubbleData: undefined,
    },
    singleGene: function(){
      this.s = true;
      this.single.status = true;
      this.countdown.status = false;
      this.gameMode = 'singleMode';
      this.numOfColumn = 8;
      this.turnCount = 0;
      this.shake.status = false;
      this.gameOver.status = false;
      this.single.background.num=Math.floor(Math.random()*this.single.background.maxNum);
      this.single.player.curBubble.num=this.bubbleGenerator();
      this.single.player.nextBubble.num=this.bubbleGenerator();
      this.single.player.thirdBubble.num=this.bubbleGenerator();
      this.single.player.arrow.angle=0;
      this.single.player.score=0;
      this.single.bubbleData=new Array(12);
      for(var i=0;i<this.single.bubbleData.length;i++){
        this.single.bubbleData[i]={};
        var gapOffset=0;
        var xPosOffset=0;
        if(i%2 === 0){
          this.single.bubbleData[i].isGap=false;
        }
        else {
          this.single.bubbleData[i].isGap=true;
          xPosOffset=16;
        }
        var x=76+16;
        var y=15+16;
        if(i<3){
          for(var j=0; j<this.numOfColumn; j++){
            this.single.bubbleData[i][j]={};
            if(j==13 && this.single.bubbleData[i].isGap){
              this.single.bubbleData[i][j].num=null;
            }
            else {
              this.single.bubbleData[i][j].num=Math.floor(Math.random()*this.bubbles.numberOfColor)*3;
            }
            this.single.bubbleData[i][j].isFalling=false;
            this.single.bubbleData[i][j].x=x+j*32+xPosOffset;
            this.single.bubbleData[i][j].y=y+i*28;
            this.single.bubbleData[i][j].obstacleChecked=false;
          }
        }
        else{
          for(var j=0; j<this.numOfColumn; j++){
            this.single.bubbleData[i][j]={};
            this.single.bubbleData[i][j].num=null;
            this.single.bubbleData[i][j].isFalling=false;
            this.single.bubbleData[i][j].x=x+j*32+xPosOffset;
            this.single.bubbleData[i][j].y=y+i*28;
            this.single.bubbleData[i][j].obstacleChecked=false;
          }
        }
        this.bubbleData = this.single.bubbleData;
      }
      input.checkKeyHit(KEY_SPACE);
      this.timerGene();
    },
    singleDraw: function(){
      ctx.save();
      //black background & gamebBackground & stage frame
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.drawImage(this.backgroundSheet, this.single.background[this.single.background.num].sX, this.single.background[this.single.background.num].sY, this.single.background[this.single.background.num].width, this.single.background[this.single.background.num].height, this.single.background[this.single.background.num].x, this.single.background[this.single.background.num].y, this.single.background[this.single.background.num].width*2, this.single.background[this.single.background.num].height*2);
      ctx.drawImage(this.spriteSheet, this.single.gameFrame.sX, this.single.gameFrame.sY, this.single.gameFrame.width, this.single.gameFrame.height, this.single.gameFrame.x, this.single.gameFrame.y, this.single.gameFrame.width, this.single.gameFrame.height);
      ctx.drawImage(this.spriteSheet, this.single.luncher.sX, this.single.luncher.sY, this.single.luncher.width, this.single.luncher.height, this.single.luncher.x, this.single.luncher.y, this.single.luncher.width, this.single.luncher.height);
      //gameBubbles
      var shakeOffset=0;
      if(this.shake.status && this.gameOver.status !== true){
        shakeOffset=this.shake.offset;
      }
      for(var i=0;i<this.single.bubbleData.length;i++){
        var offset = this.gapOffset(i);
        for(var j=0; j<this.numOfColumn+offset; j++){
          if(this.single.bubbleData[i][j].num!==null){
            ctx.drawImage(this.spriteSheet, this.bubbles[this.single.bubbleData[i][j].num].sX, this.bubbles[this.single.bubbleData[i][j].num].sY, this.bubbles.width, this.bubbles.height, this.single.bubbleData[i][j].x-16+shakeOffset, this.single.bubbleData[i][j].y-16, this.bubbles.width, this.bubbles.height);
          }
        }
      }
      //player arrow & bubbles
      ctx.save();
      ctx.translate(this.single.player.arrow.x+8,this.single.player.arrow.y+44);
      ctx.rotate(this.single.player.arrow.angle*Math.PI/180);
      ctx.drawImage(this.spriteSheet, this.single.player.arrow.sX, this.single.player.arrow.sY, this.single.player.arrow.width, this.single.player.arrow.height, -8, -44, this.single.player.arrow.width, this.single.player.arrow.height);
      ctx.restore();
      if(this.single.player.curBubble.isShow) ctx.drawImage(this.spriteSheet, this.bubbles[this.single.player.curBubble.num].sX, this.bubbles[this.single.player.curBubble.num].sY, this.bubbles.width, this.bubbles.height, this.single.player.curBubble.x-16, this.single.player.curBubble.y-16, this.bubbles.width, this.bubbles.height);
      ctx.drawImage(this.spriteSheet, this.bubbles[this.single.player.nextBubble.num].sX, this.bubbles[this.single.player.nextBubble.num].sY, this.bubbles.width, this.bubbles.height, this.single.player.nextBubble.x-16, this.single.player.nextBubble.y-16, this.bubbles.width, this.bubbles.height);
      ctx.drawImage(this.spriteSheet, this.bubbles[this.single.player.thirdBubble.num].sX, this.bubbles[this.single.player.thirdBubble.num].sY, this.bubbles.width, this.bubbles.height, this.single.player.thirdBubble.x-16, this.single.player.thirdBubble.y-16, this.bubbles.width, this.bubbles.height);
      //score
      ctx.font='25px Arial';
      ctx.strokeStyle='rgb(0,0,0)';
      ctx.lineWidth=5;
      ctx.fillStyle='rgb(255,255,255)';
      ctx.textAlign='left';
      ctx.strokeText('YOUR SCORE', 360, 80);
      ctx.fillText('YOUR SCORE', 360, 80);
      ctx.textAlign='right';
      ctx.strokeText(this.single.player.score, 570, 120);
      ctx.fillText(this.single.player.score, 570, 120);
      ctx.restore();
    },
    singleUpdate: function(){
      this.bubbleFallingDraw();
      this.bubbleFallingUpdate();
      this.obstacleBubbleDraw();
      this.obstacleBubbleUpdate();
      this.timerDraw();
      if(this.timer.timeLeft<6&&this.timer.timeLeft != this.countdown.string){
        this.countdownGene(this.timer.timeLeft);
      }
      if(this.gameOver.status !== true){
        this.timerUpdate();
      }
      if(this.countdown.status){
        this.countdownDraw();
        this.countdownUpdate();
      }
      if(this.timer.timeLeft==0 && this.gameOver.status !== true){
        this.gameOverGene(this.single.player.score);
      }
      if(bubble.gameOver.status !== true){
        this.control(this.single.player);
      }
    },
    battle: {
      status:false,
      background: {
        num: undefined,
        maxNum: 1,
        0:{ x:76, y:15, sX:0, sY:0, width:224, height:186 }
      },
      gameFrameLeft: { x:64, y:3, sX:0, sY:84, width:236, height:394 },
      gameFrameRight: { x:300, y:3, sX:44, sY:84, width:236, height:394 },
      luncherLeft: { x:76, y:317, sX:252, sY:482, width:224, height:68 },
      luncherRight: { x:300, y:317, sX:252, sY:482, width:224, height:68 },
      whoseTurn: undefined,
      whoHasControl: undefined,
      leftButtonToggle: undefined,
      rightButtonToggle: undefined,
      player: {
        1:{
          score: undefined,
          arrow: { angle: 0, x:180, y:304, sX:216, sY:482, width:16, height:80 },
          borderLeft: 77,
          curBubble:{ isShow:true, num:undefined, x:188, y:347 },
          nextBubble:{ num:undefined, x:153, y:369 },
          thirdBubble:{ num:2, x:114, y:369 }
        },
        2:{
          score: undefined,
          arrow: { angle: 0, x:404, y:299+4, sX:216, sY:482, width:16, height:80 },
          borderLeft: 285,
          curBubble:{ isShow:true, num:undefined, x:412, y:347 },
          nextBubble:{ num:undefined, x:377, y:369 },
          thirdBubble:{ num:2, x:338, y:369 }
        },
        bubbleData:undefined,
      }
    },
    battleGene: function(){
      this.battle.status = true;
      this.gameMode = 'battleMode';
      this.numOfColumn = 14;
      this.turnCount = 0;
      this.shake.status = false;
      this.gameOver.status = false;
      this.angleOriginal = 0;
      this.angleTouchOffset = 0;
      this.battle.whoseTurn = 1;
      this.battle.whoHasControl = 1;
      this.battle.leftButtonToggle = false;
      this.battle.rightButtonToggle = false;
      this.battle.background.num=Math.floor(Math.random()*this.battle.background.maxNum);
      this.battle.player[1].curBubble.num=this.bubbleGenerator();
      this.battle.player[1].nextBubble.num=this.bubbleGenerator();
      this.battle.player[1].thirdBubble.num=this.bubbleGenerator();
      this.battle.player[1].score=0;
      this.battle.player[1].arrow.angle=0
      this.battle.player[2].curBubble.num=this.bubbleGenerator();
      this.battle.player[2].nextBubble.num=this.bubbleGenerator();
      this.battle.player[2].thirdBubble.num=this.bubbleGenerator();
      this.battle.player[2].score=0;
      this.battle.player[2].arrow.angle=0;
      this.battle.bubbleData=new Array(12);
      for(var i=0;i<this.battle.bubbleData.length;i++){
        this.battle.bubbleData[i]={};
        var gapOffset=0;
        var xPosOffset=0;
        if(i%2 === 0){
          this.battle.bubbleData[i].isGap=false;
        }
        else {
          this.battle.bubbleData[i].isGap=true;
          xPosOffset=16;
        }
        var x=76+16;
        var y=15+16;
        if(i<3){
          for(var j=0; j<14; j++){
            this.battle.bubbleData[i][j]={};
            if(j==13 && this.battle.bubbleData[i].isGap){
              this.battle.bubbleData[i][j].num=null;
            }
            else {
              this.battle.bubbleData[i][j].num=Math.floor(Math.random()*this.bubbles.numberOfColor)*3;
            }
            this.battle.bubbleData[i][j].isFalling=false;
            this.battle.bubbleData[i][j].x=x+j*32+xPosOffset;
            this.battle.bubbleData[i][j].y=y+i*28;
            this.battle.bubbleData[i][j].obstacleChecked=false;
          }
        }
        else{
          for(var j=0; j<14; j++){
            this.battle.bubbleData[i][j]={};
            this.battle.bubbleData[i][j].num=null;
            this.battle.bubbleData[i][j].isFalling=false;
            this.battle.bubbleData[i][j].x=x+j*32+xPosOffset;
            this.battle.bubbleData[i][j].y=y+i*28;
            this.battle.bubbleData[i][j].obstacleChecked=false;
          }
        }
        this.bubbleData = this.battle.bubbleData;
      }
      input.checkKeyHit(KEY_SPACE);
    },
    battleDraw: function(){
      //black background & gamebBackground & stage frame
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.drawImage(this.backgroundSheet, this.battle.background[this.battle.background.num].sX, this.battle.background[this.battle.background.num].sY, this.battle.background[this.battle.background.num].width, this.battle.background[this.battle.background.num].height, this.battle.background[this.battle.background.num].x, this.battle.background[this.battle.background.num].y, this.battle.background[this.battle.background.num].width*2, this.battle.background[this.battle.background.num].height*2);
      ctx.drawImage(this.spriteSheet, this.battle.gameFrameLeft.sX, this.battle.gameFrameLeft.sY, this.battle.gameFrameLeft.width, this.battle.gameFrameLeft.height, this.battle.gameFrameLeft.x, this.battle.gameFrameLeft.y, this.battle.gameFrameLeft.width, this.battle.gameFrameLeft.height);
      ctx.drawImage(this.spriteSheet, this.battle.gameFrameRight.sX, this.battle.gameFrameRight.sY, this.battle.gameFrameRight.width, this.battle.gameFrameRight.height, this.battle.gameFrameRight.x, this.battle.gameFrameRight.y, this.battle.gameFrameRight.width, this.battle.gameFrameRight.height);
      ctx.drawImage(this.spriteSheet, this.battle.luncherLeft.sX, this.battle.luncherLeft.sY, this.battle.luncherLeft.width, this.battle.luncherLeft.height, this.battle.luncherLeft.x, this.battle.luncherLeft.y, this.battle.luncherLeft.width, this.battle.luncherLeft.height);
      ctx.drawImage(this.spriteSheet, this.battle.luncherRight.sX, this.battle.luncherRight.sY, this.battle.luncherRight.width, this.battle.luncherRight.height, this.battle.luncherRight.x, this.battle.luncherRight.y, this.battle.luncherRight.width, this.battle.luncherRight.height);
      //gameBubbles
      var shakeOffset=0;
      if(this.shake.status && this.gameOver.status !== true){
        shakeOffset=this.shake.offset;
      }
      for(var i=0;i<this.battle.bubbleData.length;i++){
        var offset = this.gapOffset(i);
        for(var j=0; j<14+offset; j++){
          if(this.battle.bubbleData[i][j].num!==null){
            ctx.drawImage(this.spriteSheet, this.bubbles[this.battle.bubbleData[i][j].num].sX, this.bubbles[this.battle.bubbleData[i][j].num].sY, this.bubbles.width, this.bubbles.height, this.battle.bubbleData[i][j].x-16+shakeOffset, this.battle.bubbleData[i][j].y-16, this.bubbles.width, this.bubbles.height);
          }
        }
      }
      //player[1] arrow & bubbles
      ctx.save();
      ctx.translate(this.battle.player[1].arrow.x+8,this.battle.player[1].arrow.y+44);
      ctx.rotate(this.battle.player[1].arrow.angle*Math.PI/180);
      ctx.drawImage(this.spriteSheet, this.battle.player[1].arrow.sX, this.battle.player[1].arrow.sY, this.battle.player[1].arrow.width, this.battle.player[1].arrow.height, -8, -44, this.battle.player[1].arrow.width, this.battle.player[1].arrow.height);
      ctx.restore();
      if(this.battle.player[1].curBubble.isShow) ctx.drawImage(this.spriteSheet, this.bubbles[this.battle.player[1].curBubble.num].sX, this.bubbles[this.battle.player[1].curBubble.num].sY, this.bubbles.width, this.bubbles.height, this.battle.player[1].curBubble.x-16, this.battle.player[1].curBubble.y-16, this.bubbles.width, this.bubbles.height);
      ctx.drawImage(this.spriteSheet, this.bubbles[this.battle.player[1].nextBubble.num].sX, this.bubbles[this.battle.player[1].nextBubble.num].sY, this.bubbles.width, this.bubbles.height, this.battle.player[1].nextBubble.x-16, this.battle.player[1].nextBubble.y-16, this.bubbles.width, this.bubbles.height);
      ctx.drawImage(this.spriteSheet, this.bubbles[this.battle.player[1].thirdBubble.num].sX, this.bubbles[this.battle.player[1].thirdBubble.num].sY, this.bubbles.width, this.bubbles.height, this.battle.player[1].thirdBubble.x-16, this.battle.player[1].thirdBubble.y-16, this.bubbles.width, this.bubbles.height);
      //player[2] arrow & bubble
      ctx.save();
      ctx.translate(this.battle.player[2].arrow.x+8,this.battle.player[2].arrow.y+44);
      ctx.rotate(this.battle.player[2].arrow.angle*Math.PI/180);
      ctx.drawImage(this.spriteSheet, this.battle.player[2].arrow.sX, this.battle.player[2].arrow.sY, this.battle.player[2].arrow.width, this.battle.player[2].arrow.height, -8, -44, this.battle.player[2].arrow.width, this.battle.player[2].arrow.height);
      ctx.restore();
      if(this.battle.player[2].curBubble.isShow) ctx.drawImage(this.spriteSheet, this.bubbles[this.battle.player[2].curBubble.num].sX, this.bubbles[this.battle.player[2].curBubble.num].sY, this.bubbles.width, this.bubbles.height, this.battle.player[2].curBubble.x-16, this.battle.player[2].curBubble.y-16, this.bubbles.width, this.bubbles.height);
      ctx.drawImage(this.spriteSheet, this.bubbles[this.battle.player[2].nextBubble.num].sX, this.bubbles[this.battle.player[2].nextBubble.num].sY, this.bubbles.width, this.bubbles.height, this.battle.player[2].nextBubble.x-16, this.battle.player[2].nextBubble.y-16, this.bubbles.width, this.bubbles.height);
      ctx.drawImage(this.spriteSheet, this.bubbles[this.battle.player[2].thirdBubble.num].sX, this.bubbles[this.battle.player[2].thirdBubble.num].sY, this.bubbles.width, this.bubbles.height, this.battle.player[2].thirdBubble.x-16, this.battle.player[2].thirdBubble.y-16, this.bubbles.width, this.bubbles.height);

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect((this.battle.whoseTurn == 1)?(316):(76), 15, 208, 370)
    },
    battleUpdate: function(){
      this.bubbleFallingDraw();
      this.bubbleFallingUpdate();
      this.obstacleBubbleDraw();
      this.obstacleBubbleUpdate();
      if(bubble.gameOver.status !== true){
        this.control(this.battle.player[this.battle.whoHasControl]);
      }
    },
    bubbleGenerator: function(){
      var randNum=Math.random();
      var type;
      if(randNum<0.9){
        type=0;
      }
      else if(randNum<0.95){
        type=1;
        return 16;
      }
      else {
        if(this.gameMode=='singleMode'){
          type=1;
          return 16;
        }
        else {
          type=2;
        }
      }
      return (Math.floor(Math.random()*this.bubbles.numberOfColor)*3+type);
    },
    bubbleReloader: function(){
      switch(this.gameMode){
        case 'battleMode':
          this.battle.player[this.battle.whoseTurn].curBubble.num=this.battle.player[this.battle.whoseTurn].nextBubble.num;
          this.battle.player[this.battle.whoseTurn].nextBubble.num=this.battle.player[this.battle.whoseTurn].thirdBubble.num;
          this.battle.player[this.battle.whoseTurn].thirdBubble.num=this.bubbleGenerator();
          this.battle.player[this.battle.whoseTurn].curBubble.isShow=true;
          break;
        case 'singleMode':
          this.single.player.curBubble.num=this.single.player.nextBubble.num;
          this.single.player.nextBubble.num=this.single.player.thirdBubble.num;
          this.single.player.thirdBubble.num=this.bubbleGenerator();
          this.single.player.curBubble.isShow=true;
          break;
        case 'demoMode':
          this.menu.instruction.player.curBubble.num=this.menu.instruction.player.nextBubble.num;
          this.menu.instruction.player.nextBubble.num=this.menu.instruction.player.thirdBubble.num;
          this.menu.instruction.player.thirdBubble.num=this.bubbleGenerator();
          this.menu.instruction.player.curBubble.isShow=true;
          break;
      }
    },
    control: function(player){
      if(input.touch.touched){
        this.angleTouchOffset=(input.touch.endX - input.touch.startX)/5;
        player.arrow.angle = this.angleTouchOffset+this.angleOriginal;
      }
      else {
        this.angleOriginal = player.arrow.angle;
      }
      if(input.keyStates[KEY_LEFT]){
        player.arrow.angle-=1;
      }
      if(input.keyStates[KEY_RIGHT]){
        player.arrow.angle+=1;
      }
      if(this.bubbleMove.status===false &&(input.checkKeyHit(KEY_SPACE) || input.mouse.clicked)){
        input.unclick();
        player.curBubble.isShow=false;
        this.bubbleMoveGene(player);
        if(this.gameMode=='battleMode'){
          (this.battle.whoHasControl==1)?this.battle.whoHasControl=2:this.battle.whoHasControl=1;
        }
      }
      if(player.arrow.angle > 75){
        player.arrow.angle = 75;
        this.angleOriginal = 75-this.angleTouchOffset;
      }
      if(player.arrow.angle < -75){
        player.arrow.angle = -75;
        this.angleOriginal = -75-this.angleTouchOffset;
      }
    },
    bubbleMove:{
      status: false,
      x: undefined,
      y: undefined,
      num: undefined,
      velocity: 10,
      xVelocity: undefined,
      yVelocity: undefined,
      borderLeft: undefined,
      borderRight: undefined
    },
    bubbleMoveGene: function(player){
      this.bubbleMove.status=true;
      this.bubbleMove.x = player.curBubble.x;
      this.bubbleMove.y = player.curBubble.y;
      this.bubbleMove.num = player.curBubble.num;
      this.bubbleMove.borderLeft = player.borderLeft;
      this.bubbleMove.borderRight = this.bubbleMove.borderLeft+238;
      this.bubbleMove.yVelocity=Number(Math.sin(player.arrow.angle*Math.PI/180-1/2*Math.PI)).toFixed(2)*this.bubbleMove.velocity;
      this.bubbleMove.xVelocity=Number(Math.cos(player.arrow.angle*Math.PI/180-1/2*Math.PI)).toFixed(2)*this.bubbleMove.velocity;
    },
    bubbleMoveUpdate: function(){
      if(this.menu.instruction.status){
        if(this.bubbleMove.y<0||this.bubbleMove.x<0||this.bubbleMove.x>WIDTH){
          this.bubbleMove.status=false;
          this.bubbleReloader();
        }
      }
      else {
        if(this.bubbleMove.x-16<this.bubbleMove.borderLeft){
          this.bubbleMove.x=this.bubbleMove.borderLeft+16;
          this.bubbleMove.xVelocity*=(-1);
        }
        else if(this.bubbleMove.x+16>this.bubbleMove.borderRight){
          this.bubbleMove.x=this.bubbleMove.borderRight-16;
          this.bubbleMove.xVelocity*=(-1);
        }
        this.bubbleGlueCheck(this.bubbleMove);
      }
      this.bubbleMove.x+=this.bubbleMove.xVelocity;
      this.bubbleMove.y+=this.bubbleMove.yVelocity;
    },
    bubbleMoveDraw: function(){
      ctx.drawImage(this.spriteSheet, this.bubbles[this.bubbleMove.num].sX, this.bubbles[this.bubbleMove.num].sY, this.bubbles.width, this.bubbles.height, this.bubbleMove.x-16, this.bubbleMove.y-16, this.bubbles.width, this.bubbles.height);
    },
    bubbleGlueCheck: function(bubbleObj){
      for(var i=0;i<this.bubbleData.length;i++){
        var offset = this.gapOffset(i);
        for(var j=0; j<this.numOfColumn+offset; j++){
          if(this.bubbleData[i][j].num!==null){
            if(common.distance(this.bubbleData[i][j], bubbleObj, 'both')<=20||(common.distance(this.bubbleData[i][j], bubbleObj, 'both')<=30 && Math.abs(this.bubbleMove.xVelocity/this.bubbleMove.yVelocity-(this.bubbleMove.x-this.bubbleData[i][j].x)/(this.bubbleMove.y-this.bubbleData[i][j].y))<=0.7)){
  //            common.dot(this.bubbleData[i][j].x,this.bubbleData[i][j].y,'blue');
  //            common.dot(bubbleObj.x,bubbleObj.y,'red');
              this.TargetPosition.xPos=j;
              this.TargetPosition.yPos=i;
              glueIt(this);
              return;
            }
          }
        }
      }
      if(bubbleObj.y-16<=17){
        glueIt(this);
        return;
      }
      function glueIt(pointer){
        pointer.bubbleGlue(bubbleObj);
        if(bubbleObj.id !== undefined){ //which means bubbleObj has id#, it means it's an obstacleBubble, not a normal bubble
          delete pointer.obstacleBubble[bubbleObj.id];
        }
        else if(pointer.bubbleMove.status){
          pointer.turnOver();
        }
      }
    },
    bubbleGlue: function(bubbleObj){
      if(this.bubbles[bubbleObj.num].special !== 'bomb'){
        this.TargetPosition={xPos:null, yPos:null, distance:60};
        for(var i=0;i<this.bubbleData.length;i++){
          var offset=this.gapOffset(i);
          for(var j=0; j<this.numOfColumn+offset; j++){
            if(this.bubbleData[i][j].num===null){
              if(common.distance(this.bubbleData[i][j], bubbleObj, 'both')<this.TargetPosition.distance){
                this.TargetPosition.distance =common.distance(this.bubbleData[i][j], bubbleObj, 'both');
                this.TargetPosition.xPos=j;
                this.TargetPosition.yPos=i;
              }
            }
          }
        }
      }

      this.bubbleData[this.TargetPosition.yPos][this.TargetPosition.xPos].num = bubbleObj.num;
      this.bubbleData[this.TargetPosition.yPos][this.TargetPosition.xPos].obstacleChecked = false;
      this.bubbleAction(this.TargetPosition.yPos,this.TargetPosition.xPos);
    },
    bubbleAction:function(yOrigin,xOrigin){
      var bubbleColor= Math.floor(this.bubbleData[yOrigin][xOrigin].num/3)*3;
      switch (this.bubbles[this.bubbleData[yOrigin][xOrigin].num].special) {
        case 'colorChange':
          var offset=this.gapOffset(yOrigin);
          for(var j=0;j<this.numOfColumn+offset;j++){
            if(j<xOrigin+4 && j > xOrigin-4){
              this.bubbleData[yOrigin][j].num=bubbleColor;
            }
          }
          break;
        case 'bomb':
          this.bubbleData[yOrigin][xOrigin].isFalling=true;
          var around=this.getAroundPosInfo(yOrigin,xOrigin);
          for(var i =0; i<6; i++){
            if(around[i].y >=0 && around[i].y < 12 ){
              offset=this.gapOffset(i);
              if(around[i].x >=0 && around[i].x < this.numOfColumn+offset){
                if(this.bubbleData[around[i].y][around[i].x].num!== null){
                  this.bubbleData[around[i].y][around[i].x].num =15;
                  this.bubbleData[around[i].y][around[i].x].isFalling = true;
                }
              }
              this.fallingProvoke();
              this.unattachedCheck();
            }
          }
          break;
        case 'obstacle':
          break;
        default:
        this.bubbleColorCheck(yOrigin,xOrigin);
      }
    },
    bubbleColorCheck:function(yOrigin,xOrigin){
      this.bubbleData[yOrigin][xOrigin].isFalling=true;
      var around=this.getAroundPosInfo(yOrigin,xOrigin);

      for(var i =0; i<6; i++){
        if(around[i].y >=0 && around[i].y < 12 ){
          var offset=this.gapOffset(around[i].y);
          if(around[i].x >=0 && around[i].x < this.numOfColumn+offset){
            if(this.bubbleData[around[i].y][around[i].x].num==this.bubbleData[yOrigin][xOrigin].num && this.bubbleData[around[i].y][around[i].x].isFalling === false){
              this.bubbleColorCheck(around[i].y,around[i].x);
            }
          }
        }
      }
    },
    turnOver: function(){
      this.bubbleMove.status=false;
      this.fallingCheck();
      this.bubbleReloader();
      this.turnCount++;
      var turnCicle = (this.gameMode=='battleMode')?9:5;
      if(this.turnCount !== 0 && (this.turnCount+3)%turnCicle === 0) {
        this.shakeGene(1, 5, 30);
      }
      else if(this.turnCount !== 0 && (this.turnCount+1)%turnCicle === 0) {
        this.shakeGene(1.5, 3, 50);
      }
      else if(this.turnCount !== 0 && this.turnCount%turnCicle === 0) {
        this.lineAdder();
        this.shake.status = false;
      }
      if(this.gameMode=='battleMode'){
        (this.battle.whoseTurn==1)?this.battle.whoseTurn=2:this.battle.whoseTurn=1;
        if(this.bubbleFalling.count>4){
          for(var i=0; i<(this.bubbleFalling.count-4)/4;i++){
            var xPos=this.battle.player[this.battle.whoseTurn].borderLeft+(Math.random()*220);
            this.obstacleBubbleGene(xPos);
          }
        }
      }
      if(this.gameMode=='singleMode'){
        if(Math.random()<0.3){
          var xPos=this.single.player.borderLeft+(Math.random()*220);
          this.obstacleBubbleGene(xPos);
        }
        this.single.player.score += this.bubbleFalling.count*100;
      }
      this.bubbleFalling.count=0;
      this.gameOverCheck();
      input.checkKeyHit(KEY_SPACE);
      input.unclick();
    },
    fallingCheck: function(){
      var count=0;
      for(var i=0;i<this.bubbleData.length;i++){
        var offset=this.gapOffset(i);
        for(var j=0; j<this.numOfColumn+offset; j++){
          if(this.bubbleData[i][j].num !== null && this.bubbleData[i][j].isFalling === true){
            count++;
          }
        }
      }
      if(count>3){
        this.obstacleCheck(this.TargetPosition.yPos,this.TargetPosition.xPos);
        this.fallingProvoke();
        this.unattachedCheck();
      }
      else {
        for(var i=0;i<this.bubbleData.length;i++){
          var offset=this.gapOffset(i);
          for(var j=0; j<this.numOfColumn+offset; j++){
            if(this.bubbleData[i][j].num !== null && this.bubbleData[i][j].isFalling === true){
              this.bubbleData[i][j].isFalling = false;
            }
          }
        }
      }
    },
    fallingProvoke: function(){
      for(i=0;i<this.bubbleData.length;i++){
        var offset=this.gapOffset(i);
        for(var j=0; j<this.numOfColumn+offset; j++){
          if(this.bubbleData[i][j].num !== null && this.bubbleData[i][j].isFalling === true){
            this.bubbleFallingGene(this.bubbleData[i][j].y,this.bubbleData[i][j].x,this.bubbleData[i][j].num);
            this.bubbleData[i][j].num = null;
            this.bubbleData[i][j].isFalling = false;

          }
        }
      }
    },
    obstacleCheck:function(yOrigin,xOrigin){
      this.bubbleData[yOrigin][xOrigin].obstacleChecked=true;
      var around=this.getAroundPosInfo(yOrigin,xOrigin);

      for(var i =0; i<6; i++){
        if(around[i].y >=0 && around[i].y < 12 ){
          var offset=this.gapOffset(around[i].y);
          if(around[i].x >=0 && around[i].x < this.numOfColumn+offset){
            if(this.bubbleData[around[i].y][around[i].x].num==this.bubbleData[yOrigin][xOrigin].num && this.bubbleData[around[i].y][around[i].x].obstacleChecked === false){
              this.obstacleCheck(around[i].y,around[i].x);
            }
            if(this.bubbleData[around[i].y][around[i].x].num==99){
              this.bubbleData[around[i].y][around[i].x].isFalling=true;
            }
          }
        }
      }
    },
    unattachedCheck: function(){
      for(var i=0;i<this.bubbleData.length;i++){
        var offset=this.gapOffset(i);
        for(var j=0; j<this.numOfColumn+offset; j++){
          if(this.bubbleData[i][j].num !== null && this.bubbleData[i][j].isFalling === false){
            this.bubbleData[i][j].isFalling=true;
          }
        }
      }
      var offset=this.gapOffset(0);
      for(var j=0; j<this.numOfColumn+offset; j++){
        if(this.bubbleData[0][j].num !== null && this.bubbleData[0][j].isFalling === true){
          this.unattachedCheckRecursive(0,j);
        }
      }
      this.fallingProvoke();
    },
    unattachedCheckRecursive: function(yOrigin,xOrigin){
      this.bubbleData[yOrigin][xOrigin].isFalling=false;
      var around=this.getAroundPosInfo(yOrigin,xOrigin);

      for(var i =0; i<6; i++){
        if(around[i].y >=0 && around[i].y < 12 ){
          var offset = this.gapOffset(around[i].y);
          if(around[i].x >=0 && around[i].x < this.numOfColumn+offset){
            if(this.bubbleData[around[i].y][around[i].x].num !==null && this.bubbleData[around[i].y][around[i].x].isFalling === true){
              this.unattachedCheckRecursive(around[i].y,around[i].x);
            }
          }
        }
      }
    },
    bubbleFalling: {count:0}, // count is for battle mode to generate obstacle bubbles
    bubbleFallingReset: function(){
      this.bubbleFalling = {count:0};
    },
    bubbleFallingGene: function(yOrigin, xOrigin, numOrigin){
      for(var i=0; i<100; i++){
        if(this.bubbleFalling[i]===undefined){
          this.bubbleFalling[i]={num:numOrigin,x:xOrigin,y:yOrigin,yValocity:-Math.random()*4,xValocity:Math.random()*6-3};
          this.bubbleFalling.count++;
          break;
        }
      }
    },
    bubbleFallingUpdate: function(){
      for(var i=0; i<100; i++){
        if(this.bubbleFalling[i]!==undefined){
          this.bubbleFalling[i].y+=this.bubbleFalling[i].yValocity;
          this.bubbleFalling[i].x+=this.bubbleFalling[i].xValocity;
          this.bubbleFalling[i].yValocity+=this.GRAVITY;
          if(this.bubbleFalling[i].y>WIDTH+16){
            delete this.bubbleFalling[i];
          }
        }
      }
    },
    bubbleFallingDraw: function(){
      for(var i=0; i<100; i++){
        if(this.bubbleFalling[i]!==undefined){
          ctx.drawImage(this.spriteSheet, this.bubbles[this.bubbleFalling[i].num].sX, this.bubbles[this.bubbleFalling[i].num].sY, this.bubbles.width, this.bubbles.height, this.bubbleFalling[i].x-16, this.bubbleFalling[i].y-16, this.bubbles.width, this.bubbles.height);
        }
      }
    },
    obstacleBubble: {},
    obstacleBubbleReset: function(){
      this.obstacleBubble = {};
    },
    obstacleBubbleGene: function(xOrigin){
      for(var i=0; i<100; i++){
        if(this.obstacleBubble[i]===undefined){
          this.obstacleBubble[i]={id:i,num:99,xOrigin:xOrigin,x:xOrigin,y:HEIGHT+30+(Math.random()*50-25),yValocity:-2,xValocity:(Math.random()*4-2)};
          break;
        }
      }
    },
    obstacleBubbleUpdate: function(){
      for(var i=0; i<100; i++){
        if(this.obstacleBubble[i]!==undefined){
          this.obstacleBubble[i].y+=this.obstacleBubble[i].yValocity;
          this.obstacleBubble[i].x+=this.obstacleBubble[i].xValocity;
          this.obstacleBubble[i].yValocity-=this.GRAVITY*2;
          if(this.obstacleBubble[i].x<this.obstacleBubble[i].xOrigin-5 || this.obstacleBubble[i].x>this.obstacleBubble[i].xOrigin+5){
            this.obstacleBubble[i].xValocity*= -1;
          }
          this.bubbleGlueCheck(this.obstacleBubble[i]);
        }
      }
    },
    obstacleBubbleDraw: function(){
      for(var i=0; i<100; i++){
        if(this.obstacleBubble[i]!==undefined){
          ctx.drawImage(this.spriteSheet, this.bubbles[this.obstacleBubble[i].num].sX, this.bubbles[this.obstacleBubble[i].num].sY, this.bubbles.width, this.bubbles.height, this.obstacleBubble[i].x-16, this.obstacleBubble[i].y-16, this.bubbles.width, this.bubbles.height);
        }
      }
    },
    lineAdder: function(){
      var x=76+16;
      var y=15+16;
      var xPosOffset=0;
      for(var i=this.bubbleData.length-1; i>0; i--){
        this.bubbleData[i]=this.bubbleData[i-1];
        var offset = this.gapOffset(i);
        for(var j=0;j<this.numOfColumn+offset;j++){
          this.bubbleData[i][j].y=y+i*28;
        }
      }
      this.bubbleData[0]={};
      if(this.bubbleData[1].isGap){
        this.bubbleData[0].isGap=false;
      }
      else{
        this.bubbleData[0].isGap=true;
        xPosOffset=16;
      }
      for(var j=0; j<this.numOfColumn+this.gapOffset(0); j++){
        this.bubbleData[0][j]={};
        if(j==13 && this.bubbleData[0].isGap){
          this.bubbleData[0][j].num=null;
        }
        else {
          this.bubbleData[0][j].num=Math.floor(Math.random()*this.bubbles.numberOfColor)*3;
        }
        this.bubbleData[0][j].obstacleChecked=false;
        this.bubbleData[0][j].isFalling=false;
        this.bubbleData[0][j].x=x+j*32+xPosOffset;
        this.bubbleData[0][j].y=y+i*28;
      }
      this.gameOverCheck();
    },
    shake:{
      status: false,
      offset: 0,
      count: undefined,
      power: undefined,
      duration: undefined,
      COUNT_MAX: 100
    },
    shakeGene: function(power, speed, duration){
      this.shake.status = true;
      this.shake.offset = 0;
      this.shake.power = power;
      this.shake.speed = speed;
      this.shake.duration = duration;
      this.shake.count = 100;
    },
    shakeUpdate: function(){
      if(this.shake.count>0){
        this.shake.count--;
      }
      else {
        this.shake.count = this.shake.COUNT_MAX;
      }
      if(this.shake.count>100-this.shake.duration && this.shake.count%this.shake.speed === 0){
        this.shake.offset=(this.shake.offset==this.shake.power)?(-this.shake.power):(this.shake.power);
      }
      else {
        this.shake.offset=0;
      }
    },
    gameOverCheck: function(){
      var lastRow=bubble.bubbleData.length-1;
      var offset=this.gapOffset(lastRow);
      switch(this.gameMode){
        case 'battleMode':
          var isP1Lose=false, isP2Lose=false;
          for(var j=0; j<this.numOfColumn+offset; j++){
            if(this.bubbleData[lastRow][j].num !== null){
              if(j<7+offset){
                isP1Lose=true;
              }
              else if(j>6){
                isP2Lose=true;
              }
            }
          }
          if(isP1Lose&&isP2Lose){
            this.gameOverGene('Draw!');
          }
          else if(isP1Lose){
            this.gameOverGene('Player 2 Win!');
          }
          else if(isP2Lose){
            this.gameOverGene('Player 1 Win!');
          }
          break;
        case 'singleMode':
          for(var j=0; j<this.numOfColumn+offset; j++){
            if(this.bubbleData[lastRow][j].num !== null){
            this.gameOverGene(this.single.player.score);
            }
          }
          break;
      }
    },
    gameOver:{
      count:undefined,
      COUNT_MAX:100,
      status:undefined,
      result:{
        status:undefined,
        string:undefined,
        x:300,
        y:150,
        size: undefined,
        transparent: undefined,
      },
      headLine:{
        string: 'GAME OVER',
        x: 300,
        y: 100,
        size: undefined
      }
    },
    gameOverGene: function(str){
      this.gameOver.status = true;
      this.gameOver.result.status = false;
      this.gameOver.result.size = 0;
      this.gameOver.result.string = str;
      this.gameOver.headLine.size = 0;
      this.gameOver.count = 0;
      if(this.gameMode=='singleMode' && this.s){
        this.s = false;
        common.postInfo('hw2',this.single.player.score);
      }
    },
    gameOverUpdate: function(){
      if(this.gameOver.count<this.gameOver.COUNT_MAX){
        this.gameOver.count++;
        this.gameOver.headLine.size=20+this.gameOver.count*0.3;
      }
      if(this.gameOver.count>29 && this.gameOver.count<81){
        if(this.gameOver.count<61){
          this.gameOver.result.transparent=1-(60-this.gameOver.count)/30;
        }
        this.gameOver.result.status=true;
        this.gameOver.result.size=30+this.gameOver.count*0.1;
      }
      if(this.gameOver.count == 70){
        input.unclick();
        this.menuGene(this.gameMode);
      }
    },
    gameOverDraw: function(){
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.textAlign='center';
      ctx.font=this.gameOver.headLine.size+'px Arial';
      ctx.strokeStyle='rgb(0,0,0)';
      ctx.lineWidth=5;
      ctx.strokeText(this.gameOver.headLine.string, this.gameOver.headLine.x, this.gameOver.headLine.y);
      ctx.fillStyle='rgb(255,255,255)';
      ctx.fillText(this.gameOver.headLine.string, this.gameOver.headLine.x, this.gameOver.headLine.y);
      if(this.gameOver.result.status){
        ctx.font=this.gameOver.result.size+'px Arial';
        ctx.strokeStyle='rgba(0,0,0,'+this.gameOver.result.transparent+')';
        ctx.lineWidth=5;
        ctx.strokeText(this.gameOver.result.string, this.gameOver.result.x, this.gameOver.result.y);
        ctx.fillStyle='rgba(255,255,255,'+this.gameOver.result.transparent+')';
        ctx.fillText(this.gameOver.result.string, this.gameOver.result.x, this.gameOver.result.y);
      }
      ctx.restore();
    },
    countdown: { //singleMode only
      string: '',
      status: false,
      gap: 40,
      x: 200,
      y: 220,
      stringNum: 0,
      count: undefined,
    },
    countdownGene: function(num){
      this.countdown.status = true;
      this.countdown.count = 30;
      this.countdown.string = num;
    },
    countdownUpdate: function(){
      if(this.countdown.count>0) this.countdown.count--;
    },
    countdownDraw: function(){
      var scaleOffset = (1-(this.countdown.count)/this.countdown.gap)*30+100;
      var alphaOffset = (1-(this.countdown.count)/this.countdown.gap)*0.5;
      ctx.save();
      ctx.textAlign='center';
      ctx.font = scaleOffset+'px Arial';
      ctx.fillStyle = 'rgba(0,0,0,'+alphaOffset+')';
      ctx.fillText(this.countdown.string, this.countdown.x, this.countdown.y);
      ctx.restore();
    },
    timer:{ //singleMode only
      string:'TIME :',
      stringX: 360,
      stringY: 40,
      timeMax: 60,
      timeLeft: undefined,
      timeLeftX: 360+110,
      timeLeftY: 40,
      strtingTime: undefined,
      currentTime: undefined
    },
    timerGene: function(){
      var time = new Date();
      this.timer.startingTime = time.getTime();
    },
    timerUpdate: function(){
      var time = new Date();
      this.timer.timeLeft = this.timer.timeMax-Math.round((time.getTime()-this.timer.startingTime)/1000);
    },
    timerDraw: function(){
      ctx.save()
      ctx.font='25px Arial';
      ctx.strokeStyle='rgb(0,0,0)';
      ctx.lineWidth=5;
      ctx.fillStyle='rgb(255,255,255)';
      ctx.textAlign='left';
      ctx.strokeText(this.timer.string, this.timer.stringX, this.timer.stringY);
      ctx.fillText(this.timer.string, this.timer.stringX, this.timer.stringY);
      ctx.textAlign='right';
      ctx.strokeText(this.timer.timeLeft, this.timer.timeLeftX, this.timer.timeLeftY);
      ctx.fillText(this.timer.timeLeft, this.timer.timeLeftX, this.timer.timeLeftY);
      ctx.restore();
    },
    rank:{
      status:false,
      scoreDiv: undefined,
      scoreIframe: undefined,
      menu: {x:380, y:320, width:80, height:25, string:'RETURN'}
    },
    rankGene: function(){
      $('#helloWorld').trigger('show-ranking','bubble');
    },
    rankUpdate: function(){
      if(input.checkRectClicked(this.rank.menu.x,this.rank.menu.y-this.rank.menu.height,this.rank.menu.width,this.rank.menu.height)){
        this.rank.status=false;
        this.rank.scoreDiv.remove();
        this.rank.scoreIframe.remove();
        this.menuGene('main');
      }
    },
    rankDraw: function(){
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.font = this.rank.menu.height+'px Arial';
      ctx.strokeStyle='rgb(0,0,0)'
      ctx.lineWidth=5;
      ctx.fillStyle='rgb(255,255,255)';
      ctx.strokeText(this.rank.menu.string, this.rank.menu.x, this.rank.menu.y);
      ctx.fillText(this.rank.menu.string, this.rank.menu.x, this.rank.menu.y);
      ctx.restore();
    },
    gapOffset: function(lineNum){
      var offset=0;
      if (this.bubbleData[lineNum].isGap){
        offset= -1;
      }
      return offset;
    },
    getAroundPosInfo: function(yOrigin,xOrigin){
      var around={
        0:{y:yOrigin, x:xOrigin-1},
        3:{y:yOrigin, x:xOrigin+1},
        };

      if(this.bubbleData[yOrigin].isGap){
        around[1]={y:yOrigin-1, x:xOrigin};
        around[2]={y:yOrigin-1, x:xOrigin+1};
        around[4]={y:yOrigin+1, x:xOrigin+1};
        around[5]={y:yOrigin+1, x:xOrigin};
      }
      else {
        around[1]={y:yOrigin-1, x:xOrigin-1};
        around[2]={y:yOrigin-1, x:xOrigin};
        around[4]={y:yOrigin+1, x:xOrigin};
        around[5]={y:yOrigin+1, x:xOrigin-1};
      }
      return around;
    },
  };

  var bubbleGame =  new Thing(ROOT_DIR+'src/things.png', 600, 250, 98, 98, null, 70);
  bubbleGame.standing = function(){
    this.drawData.frameTotNum = 2;
    this.drawData.frame[1] = {x: 200, y: 500};
    this.drawData.frame[2] = {x: 300, y: 500};
  };
  bubbleGame.update = function(){
    if(bubble.status){
      if(bubble.menu.status){
        bubble.menuUpdate();
      }
      if(bubble.battle.status){
        bubble.battleDraw();
        bubble.battleUpdate();
      }
      if(bubble.single.status){
        bubble.singleDraw();
        bubble.singleUpdate();
      }
      if(bubble.shake.status){
        bubble.shakeUpdate();
      }
      if(bubble.gameOver.status){
        bubble.gameOverDraw();
        bubble.gameOverUpdate();
      }
      if(bubble.menu.status){
        bubble.menuDraw();
        bubble.menuUpdate();
      }
      if(bubble.bubbleMove.status){
        bubble.bubbleMoveDraw();
        bubble.bubbleMoveUpdate();
      }
      if(bubble.rank.status){
        bubble.rankDraw();
        bubble.rankUpdate();
      }
    }
    thingObj.update.call(this);
  };
  bubbleGame.action = function(){
    bubble.powerOn();
  };

  var wam = {
    spriteSheet: common.createImage(ROOT_DIR+'wam/wam.png'),
    status: false,
    startingTime: null,
    score: undefined,
    timeCount: undefined,
    timeMax: undefined,
    COUNT_MAX: 100,
    ANI_COUNT_MAX: 20,
    reset: function(){
      this.timeMax = 60;
      this.timeCount = 60;
      this.startingTime = null;
      this.main.speed = 1;
      this.score = 0;
      for(var i = 0; i<4; i++){
        for(var j= 0; j<4; j++){
          this.hole[i][j].status = false;
        }
      }
      this.spark.status = false;
      this.hammer.status = false;
      this.item.status = false;
      this.countdown.status = false;
      this.gameOver.status = false;
      this.mole.geneCount = 0;
    },
    powerOn: function(){
      mainMessage.clear();
      input.target = 'wam';
      console.log(input);
      this.status = true;
      this.main.status = false;
      this.menuGene('gameStart');
      this.reset();
    },
    powerOff: function(){
      input.target = 'world';
      this.status = false;
    },
    menu:{
      status:false,
      background: undefined,
      title: {
        status:undefined,
        x:88,
        y:30,
        sX:0,
        sY:446,
        width:424,
        height:70
      },
      instruction: {
        status:undefined,
        x:120,
        y:110,
        sX:1032,
        sY:0,
        width:204,
        height:230
      }
    },
    menuGene: function(type) {
      this.menu.status = true;
      switch(type){
        case 'gameStart':
          this.menu.background = true;
          this.menu[1] = {x:380, y:165, width:80, height:25, string:'PLAY'};
          this.menu[2] = {x:380, y:210, width:80, height:25, string:'RANKS'};
          this.menu[3] = {x:380, y:255, width:80, height:25, string:'EXIT'};
          this.menu.title.status=true;
          this.menu.instruction.status=true;
          break;
        case 'gameOver':
          this.menu.background = false;
          this.menu[1] = {x:450, y:100, width:120, height:25, string:'PLAY AGAIN'};
          this.menu[2] = {x:462, y:145, width:80, height:25, string:'RANKS'};
          this.menu[3] = {x:477, y:190, width:80, height:25, string:'EXIT'};
          this.menu.title.status=false;
          this.menu.instruction.status=false;
          break;
      }
    },
    menuUpdate: function(){
      for(var i=1; i<=3; i++){
        if(input.checkRectClicked(this.menu[i].x,this.menu[i].y-this.menu[i].height,this.menu[i].width,this.menu[i].height)){
          switch(i){
            case 1:
              this.reset();
              this.menu.status = false;
              this.main.menu.status = true;
              this.readyGene();
              break;
            case 2:
              this.rankGene();
              break;
            case 3:
              this.powerOff();
              break;
          }
        }
      }
    },
    menuDraw: function(){
      ctx.save();
      if(this.menu.background){
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0,0,WIDTH,HEIGHT);
      }
      if(this.menu.title.status){
        ctx.drawImage(this.spriteSheet, this.menu.title.sX, this.menu.title.sY, this.menu.title.width, this.menu.title.height, this.menu.title.x, this.menu.title.y, this.menu.title.width, this.menu.title.height);
      }
      if(this.menu.instruction.status){
        ctx.drawImage(this.spriteSheet, this.menu.instruction.sX, this.menu.instruction.sY, this.menu.instruction.width, this.menu.instruction.height, this.menu.instruction.x, this.menu.instruction.y, this.menu.instruction.width, this.menu.instruction.height);
      }
      ctx.fillStyle='rgb(255,255,255)';
      ctx.font = this.menu[1].height+'px Arial';
      ctx.strokeStyle='rgb(0,0,0)'
      ctx.lineWidth=5;
      for(var i = 1; i<= 3; i++){
        ctx.strokeText(this.menu[i].string, this.menu[i].x, this.menu[i].y);
        ctx.fillText(this.menu[i].string, this.menu[i].x, this.menu[i].y);
      }
      ctx.restore();
    },
    rank:{
      status:false,
      scoreDiv: undefined,
      menu: {x:380, y:320, width:80, height:25, string:'RETURN'}
    },
    rankGene: function(){
      $('#helloWorld').trigger('show-ranking','wam');
    },
    rankUpdate: function(){
      if(input.checkRectClicked(this.rank.menu.x,this.rank.menu.y-this.rank.menu.height,this.rank.menu.width,this.rank.menu.height)){
        this.rank.status=false;
        this.rank.scoreDiv.remove();
        this.menuGene('gameStart');
      }
    },
    rankDraw: function(){
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.font = this.rank.menu.height+'px Arial';
      ctx.strokeStyle='rgb(0,0,0)'
      ctx.lineWidth=5;
      ctx.fillStyle='rgb(255,255,255)';
      ctx.strokeText(this.rank.menu.string, this.rank.menu.x, this.rank.menu.y);
      ctx.fillText(this.rank.menu.string, this.rank.menu.x, this.rank.menu.y);
      ctx.restore();
    },
    ready: {
      status: false,
      gap: 40,
      x: 280,
      y: 220,
      string: '',
      stringNum: 0,
      count: undefined,
    },
    readyGene: function(){
      this.ready.status = true;
      this.ready.count = 160;
      this.ready.string = '';
    },
    readyUpdate: function(){
      if(this.ready.count>=0) this.ready.count--;
      if(this.ready.count>=this.ready.gap*3) this.ready.string = '3';
      else if(this.ready.count>=this.ready.gap*2) this.ready.string = '2';
      else if(this.ready.count>=this.ready.gap*1) this.ready.string = '1';
      else if(this.ready.count>=this.ready.gap*0) this.ready.string = 'START!!';
      else {
        this.main.status = true;
        this.ready.status = false;
      }
      if(input.checkRectClicked(this.main.menu.x,this.main.menu.y-this.main.menu.height,this.main.menu.width,this.main.menu.height)){
        this.main.status=false;
        this.ready.status=false;
        this.menuGene('gameStart');
      }
      if(input.checkClicked()){
        this.hammerGene();
      }
      this.hammerUpdate();
    },
    readyDraw: function(){
      var scaleOffset = (1-(this.ready.count%this.ready.gap)/this.ready.gap)*30+100;
      var alphaOffset = 1-(this.ready.count%this.ready.gap)/this.ready.gap;
      this.mainDraw();
      ctx.save();
      ctx.textAlign='center';
      ctx.font = scaleOffset+'px Arial';
      ctx.fillStyle = 'rgba(255,255,255,'+alphaOffset+')';
      ctx.fillText(this.ready.string, this.ready.x, this.ready.y);
      ctx.restore();
    },
    main:{
      status: false,
      speed: undefined,
      menu: {status:undefined, x:500, y:320, width:80, height:25, string:'QUIT'}
    },
    mainUpdate: function(){
      this.timeUpdate();
      this.moleUpdate();
      for(var i=0; i<4;i++){
        for(var j=0; j<4; j++){
          if(this.hole[i][j].status) this.holeUpdate(this.hole[i],this.hole[i][j]);
        }
      }
      if(input.checkRectClicked(this.main.menu.x,this.main.menu.y-this.main.menu.height,this.main.menu.width,this.main.menu.height)){
        this.main.status=false;
        this.menuGene('gameStart');
      }
      if(this.hammer.status) this.hammerUpdate();
      if(this.spark.status) this.sparkUpdate();
      if(this.item.status) this.itemUpdate();
      if(this.countdown.status) this.countdownUpdate();
      if(this.timeCount<=5 && this.timeCount!=this.countdown.string) this.countdownGene();

      if(input.checkClicked()){
        this.hammerGene();
      }
      if(this.timeCount == 0){
        this.main.status = false;
        this.main.menu.status = false;
        this.mainDraw();
        this.gameOver.status = true;
        common.postInfo('hw1',this.score);
        this.menuGene('gameOver');
      }
    },
    mainDraw: function(){
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      if(this.main.menu.status){
        ctx.font = this.main.menu.height+'px Arial';
        ctx.strokeStyle='rgb(0,0,0)'
        ctx.lineWidth=5;
        ctx.fillStyle='rgb(255,255,255)';
        ctx.strokeText(this.main.menu.string, this.main.menu.x, this.main.menu.y);
        ctx.fillText(this.main.menu.string, this.main.menu.x, this.main.menu.y);
      }
      for(var i=0; i<4;i++){
        switch(i){
          case 0:
            ctx.drawImage(this.spriteSheet,  0,  0,488,127,  0,  0,487,127);
            break;
          case 1:
            ctx.drawImage(this.spriteSheet,  0,130,488, 56,  0,120,487, 56);
            break;
          case 2:
            ctx.drawImage(this.spriteSheet,  0,188,488, 61,  0,168,487, 61);
            break;
          case 3:
            ctx.drawImage(this.spriteSheet,  0,252,488, 69,  0,220,487, 69);
            break;
        }
        for(var j=0; j<4; j++){
          if(this.hole[i][j].status) this.moleDraw (i,this.hole[i][j]);
        }
      }
      ctx.drawImage(this.spriteSheet,  0,324,488,119,  0,280,487,119);
      this.timeDraw();
      this.scoreDraw();

      if(this.hammer.status) this.hammerDraw();
      if(this.spark.status) this.sparkDraw();
      if(this.item.status) this.itemDraw();
      if(this.countdown.status) this.countdownDraw();

      ctx.restore();
    },
    mole: {
      width:68,
      height:76,
      1:{ 0:{ sX:892, sY:0},
        1:{ sX:962, sY:0},
        score: 100
      },
      2:{ 0:{ sX:892, sY:80},
        1:{ sX:962, sY:80},
        score: 500
      },
      3:{ 0:{ sX:892, sY:160},
        1:{ sX:962, sY:160},
        score: 100
      },
      4:{ 0:{ sX:892, sY:240},
        1:{ sX:962, sY:240},
        score: -300
      },
      5:{ 0:{ sX:892, sY:320},
        1:{ sX:962, sY:320}
      },
      geneCount: 0
    },
    moleUpdate: function(){
      if(this.mole.geneCount > 0) this.mole.geneCount--;
      else {
        this.mole.geneCount = 50-20*(1-(this.timeCount/60));
        this.moleGene();
      }
    },
    moleGene: function(){
      var alias = {}
      var totalNum = -1;
      for(var i = 0; i<4; i++){
        for(var j= 0; j<4; j++){
          if(!this.hole[i][j].status){
            totalNum++;
            alias[totalNum]=this.hole[i][j];
          }
        }
      }
      if(totalNum>=0){
        var holeNum=Math.round(Math.random()*totalNum);
        var typeNum;
        var randNum=Math.random();
        if      (randNum<0.05) typeNum=2;
        else if (randNum<0.1) typeNum=3;
        else if (randNum<0.15) typeNum=4;
        else                  typeNum=1;
        alias[holeNum].status = true;
        alias[holeNum].type = typeNum;
        alias[holeNum].aniCount = this.ANI_COUNT_MAX;
        alias[holeNum].count = this.COUNT_MAX;
        alias[holeNum].yOffset = 70;
        alias[holeNum].hit = false;
      }
      var randNum=Math.random();
      if(randNum<0.3) this.moleGene();
    },
    moleDraw : function(lineNum, hole){
      ctx.drawImage(this.spriteSheet,this.mole[hole.type][hole.aniNum].sX,this.mole[hole.type][hole.aniNum].sY, this.mole.width, this.mole.height, hole.x, this.hole[lineNum].y+hole.yOffset, this.hole[lineNum].width, this.hole[lineNum].height);
    },
    hole: {
      0:{ y:80, width:57.2, height:63.9,
        0: { x:92, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        1: { x:176, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        2: { x:260, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        3: { x:344, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
      },
      1:{ y:123, width:60.3, height:67.4,
        0: { x:81, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        1: { x:170, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        2: { x:260, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        3: { x:348, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
      },
      2:{ y:176, width:63.4, height:70.8,
        0: { x:69, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        1: { x:165, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        2: { x:262, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        3: { x:357, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
      },
      3:{ y:230, width:68, height:76,
        0: { x:58, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        1: { x:160, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        2: { x:262, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
        3: { x:364, yOffset: 0, type: 1, status: false, hit:false, count: 0, aniNum:0, aniCount:0 },
      }
    },
    holeUpdate: function(holeY, holeX){
      if(holeX.aniCount>0) holeX.aniCount--;
      else {
        holeX.aniCount = this.ANI_COUNT_MAX;
        holeX.aniNum = (holeX.aniNum==0)?1:0;
      }
      if(holeX.count>0){
        this.main.speed = 1+(60-this.timeCount)/60;
        holeX.count -= this.main.speed;
      }
      else {
        holeX.status=false;
      }
      if(holeX.count>20 && holeX.count<85){
        if(input.checkRectClicked(holeX.x,holeY.y,holeY.width,holeY.height*0.8)){
          holeX.hit = true;
          holeX.count = 25;
          input.mouse.x = holeX.x+holeY.width/2;
          input.mouse.y = holeY.y+10;
          this.hammerGene();
          this.sparkGene();
          this.itemGene(holeX.type);
          this.score+=this.mole[holeX.type].score;
        }
      }
      if(holeX.count>85){
        holeX.yOffset = holeY.height*(1-(100-holeX.count)/15);
      }
      else if(holeX.count>20){
        holeX.yOffset = 0;
      }
      else {
        if(holeX.hit) holeX.type = 5;
        holeX.yOffset = holeY.height*(1-holeX.count/20);
      }
    },
    item:{
      status: false,
      x:0,
      y:0,
      xOffset: 30,
      yOffset: 25,
      2: {sX: 892, sY: 398},
      3: {sX: 926, sY: 398},
      4: {sX: 960, sY: 398},
      width: 32,
      height: 40,
      imgNum: 2,
      count: 20
    },
    itemGene: function(type){
      this.item.status = true;
      this.item.count = this.ANI_COUNT_MAX;
      this.item.imgNum = type;
      this.item.x = input.mouse.x-this.item.xOffset;
      this.item.y = input.mouse.y-this.item.yOffset;
      switch(type){
        case 2:
          break;
        case 3:
          this.timeMax += 3;
          break;
        case 4:
          for(var i=0; i<4;i++){
            for(var j=0; j<4; j++){
              if(this.hole[i][j].status) this.hole[i][j].status=false;
            }
          }
          break;
        default:
          this.item.status=false;
      }
    },
    itemUpdate: function(){
      if(this.item.count>0){
        this.item.count--;
        this.item.y--;
      }
      else this.item.status=false;
    },
    itemDraw: function(){
      ctx.save();

      if(this.item.count<10){
        ctx.globalAlpha = this.item.count/10;
      }
      ctx.drawImage(this.spriteSheet,this.item[this.item.imgNum].sX,this.item[this.item.imgNum].sY, this.item.width, this.item.height, this.item.x, this.item.y, this.item.width*2, this.item.height*2);
      ctx.restore();
    },
    hammer: {
      status: false,
      xOffset: 37,
      yOffset: 224,
      0: {sX: 490, sY: 0},
      1: {sX: 490, sY: 226},
      width: 200,
      height: 224,
      imgNum: 1,
      count: 20
    },
    hammerGene: function(){
      this.hammer.status = true;
      this.hammer.count = this.ANI_COUNT_MAX;
      this.hammer.imgNum = 1;
    },
    hammerUpdate: function(){
      if(this.hammer.count>0) this.hammer.count--;
      if(this.hammer.count>17) this.hammer.imgNum=1;
      else if(this.hammer.count>0) this.hammer.imgNum=0;
      else this.hammer.status=false;
    },
    hammerDraw: function(){
      ctx.drawImage(this.spriteSheet,this.hammer[this.hammer.imgNum].sX,this.hammer[this.hammer.imgNum].sY, this.hammer.width, this.hammer.height, input.mouse.x-this.hammer.xOffset, input.mouse.y-this.hammer.yOffset, this.hammer.width, this.hammer.height);
    },
    spark: {
      status: false,
      xOffset: 98,
      yOffset: 85,
      0: {sX: 693, sY: 0},
      1: {sX: 693, sY: 150},
      2: {sX: 693, sY: 300},
      width: 196,
      height: 148,
      imgNum: 0,
      count: 20
    },
    sparkGene: function(){
      this.spark.status = true;
      this.spark.count = this.ANI_COUNT_MAX;
      this.spark.imgNum = Math.round(Math.random()*2);
    },
    sparkUpdate: function(){
      if(this.spark.count>0) this.spark.count--;
      else this.spark.status=false;
    },
    sparkDraw:function(){
        ctx.drawImage(this.spriteSheet,this.spark[this.spark.imgNum].sX,this.spark[this.spark.imgNum].sY, this.spark.width, this.spark.height, input.mouse.x-this.spark.xOffset, input.mouse.y-this.spark.yOffset, this.spark.width, this.spark.height);
    },
    countdown: {
      string: '',
      status: false,
      gap: 40,
      x: 245,
      y: 220,
      stringNum: 0,
      count: undefined,
    },
    countdownGene: function(){
      this.countdown.status = true;
      this.countdown.count = 30;
      this.countdown.string = this.timeCount;
    },
    countdownUpdate: function(){
      if(this.countdown.count>0) this.countdown.count--;
    },
    countdownDraw: function(){
      var scaleOffset = (1-(this.countdown.count)/this.countdown.gap)*30+100;
      var alphaOffset = (1-(this.countdown.count)/this.countdown.gap)*0.5;
      ctx.save();
      ctx.textAlign='center';
      ctx.font = scaleOffset+'px Arial';
      ctx.fillStyle = 'rgba(255,255,255,'+alphaOffset+')';
      ctx.fillText(this.countdown.string, this.countdown.x, this.countdown.y);
      ctx.restore();
    },
    gameOver:{
      status: false
    },
    gameOverUpdate: function(){
      if(this.countdown.count>0) this.countdownUpdate();
      else this.countdown.status = false;
    },
    gameOverDraw: function(){
      this.mainDraw();
      ctx.save()
      ctx.fillStyle='rgba(0,0,0,0.7)';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.fillStyle='rgb(200,200,200)';
      ctx.font='30px Arial';
      ctx.fillText('YOUR SCORE :', 100, 100);
      ctx.fillStyle='rgb(255,255,255)';
      ctx.font='50px Arial';
      ctx.textAlign='end';
      ctx.fillText(this.score, 400, 150);
      ctx.restore();
    },
    timeUpdate:function(){
      if(this.startingTime==null){
        var d = new Date();
        this.startingTime = d.getTime();
      }
      else {
        var d = new Date();
        this.timeCount = this.timeMax-Math.round((d.getTime()-this.startingTime)/1000);
      }
    },
    timeDraw: function(){
      ctx.fillStyle='rgb(100,100,100)';
      ctx.font = '35px Arial';
      ctx.textAlign='end';
      ctx.fillText(this.timeCount, 160, 65);
    },
    scoreDraw: function(){
      ctx.fillStyle='rgb(100,100,100)';
      ctx.font = '35px Arial';
      ctx.textAlign='end';
      ctx.fillText(this.score, 404, 65);
    }
  };

  var wamGame =  new Thing(ROOT_DIR+'src/things.png', 490, 250, 98, 98, null, 70); //xpos 520
  wamGame.standing = function(){
    this.drawData.frameTotNum = 2;
    this.drawData.frame[1] = {x: 0, y: 500};
    this.drawData.frame[2] = {x: 100, y: 500};
  }
  wamGame.update = function(){
    if(wam.status){
      if(wam.rank.status){
        wam.rankDraw();
        wam.rankUpdate();
      }
      if(wam.ready.status){
        wam.readyDraw();
        wam.readyUpdate();
      }
      if(wam.main.status){
        wam.mainDraw();
        wam.mainUpdate();
      }
      if(wam.gameOver.status){
        wam.gameOverDraw();
        wam.gameOverUpdate();
      }
      if(wam.menu.status){
        wam.menuDraw();
        wam.menuUpdate();
      }
    }
    thingObj.update.call(this);
  };
  wamGame.action = function(){
    wam.powerOn();
  };

  var world = {
    interval: null,
    init: function(){
      input.init();
      this.instruction.status = true;
      this.interval = setInterval(function(){
        common.checkWindowSize();
        world.draw();
        world.update();
      }, 20);
      window.scrollTo(0,$('canvas').offset().top);
    },
    destroy: function(){
      input.destroy();

      clearInterval(this.interval);
      $('#helloWorld').html('');
    },
    backgrounds:{
      wallpaper: {spriteSheet:common.createImage(ROOT_DIR+'src/background.png'),sX:200,sY:0,sWidth:100,sHeight:100,x:0,y:50,width:WIDTH,height:200},
      floor: {spriteSheet:common.createImage(ROOT_DIR+'src/background.png'),sX:100,sY:0,sWidth:50,sHeight:50,x:0,y:250,width:WIDTH,height:50},
      clouds: {spriteSheet:common.createImage(ROOT_DIR+'src/background.png'),sX:0,sY:100,sWidth:200,sHeight:100,x:176,y:128,width:114,height:63},
    },
    instruction:{
      spriteSheet:common.createImage(ROOT_DIR+'src/instruction.png'),
      status: true,
    },
    instructionUpdate: function(){
      if(input.checkClicked()||input.keyStates.length>0){
        this.instruction.status = false;
      }
    },
    instructionDraw: function(){
      ctx.drawImage(this.instruction.spriteSheet,0,0);
      if(!name){
        ctx.save();
        ctx.font = '15px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign='center';
        var text = common._T('You\'re NOT logged in. your game score will not be saved.');
        ctx.fillText(text, WIDTH/2,380);
        ctx.restore();
      }
    },
    draw: function(){
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      common.drawBackground(this.backgrounds.wallpaper,false,'x');
      common.drawBackground(this.backgrounds.floor,false,'x');
      common.drawBackground(this.backgrounds.clouds,true);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0,0,WIDTH,50);
      ctx.fillRect(0,350,WIDTH,50);
      ctx.restore();

      window01.draw();
      table1.draw();
      refrigerator.draw();
      cat.draw();
      photoframe01.draw();
      photoframe02.draw();
      photoframe03.draw();
      girl1.draw();
      wamGame.draw();
      bubbleGame.draw();
      if(mainMessage.count>0) mainMessage.draw();
      if(offsetX>0) screenArrowLeft.draw();
      if(WIDTH+offsetX<WIDTH_END) screenArrowRight.draw();
      if(this.instruction.status) this.instructionDraw();
      player.draw();
    },
    update: function(){
      if(this.instruction.status) this.instructionUpdate();
      window01.update();
      table1.update();
      cat.update();
      refrigerator.update();
      photoframe01.update();
      photoframe02.update();
      photoframe03.update();
      girl1.update();
      screenArrowLeft.update();
      screenArrowRight.update();
      wamGame.update();
      bubbleGame.update();

      player.update();
    },
    input: input,
    wam: wam,
    bubble: bubble,
  };

  return world;
};
