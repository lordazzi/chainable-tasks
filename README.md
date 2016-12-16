# Tasks
Like native JavaScript promises, this library is designed to work with a large number of chained asynchronous requests involved with business rules and data return in a simple way.

Assim como os promises nativos de JavaScript, esta biblioteca foi desenhada para trabalhar com uma grande quantidade de requisições assíncronas encadeadas envolvendo regras de negócio e retorno de dados de uma forma simples.

    var tarefas = new Tasks.Task(function(yes, no){
         setTimeout(function(){
         	yes('love potatoes');
         }, 1000);
    }).then(function(yes, no, anything){
         console.info(anything);
         setTimeout(function(){
         	yes(anything + ' and bacon');
         }, 1000);
    }).then(function(yes, no, anything){
         console.info(anything);
         setTimeout(function(){
         	throw "error message";
         }, 1000);
    });
    
    //  see that the next task will be bind to the first one generated,
    //  but this will not change the execution order, internally this
    //  new task will be created as the last task son
    tarefas.then(function(yes, no, anything){

         // this one never will be executed because the last task is
         // lauching an exception so, the catch will be activated 
         console.info(anything);
         setTimeout(function(){
         	yes(anything + ' and onion rings');
         }, 1000);
    }).catch(function(err){
         console.error(err.message);
    });

Add new tasks in the end using the original task or some one other in the middle will help you join multiples requests and return something like a promise with data access to the programmer continue working with tasks, like this:

    var dao = {
        getProduct: (data) => {
            return new Tasks.Task((next, stop) => {
    
                $.ajax({
                    url:    "product/infos"
    
                    data:   data,
    
                    method: 'GET',
    
                    success(infos){
                        next({ 
                            type:         infos.type,
                            name:         infos.name,
                            description:  infos.description
                        });
                    },
    
                    failure(err){
                        stop(err);
                    }
                });
    
            }).then(function(next, stop, dataFromOtherRequest){
    
                $.ajax({
                    url:    "product/images"
                    
                    data:   { type: dataFromOtherRequest.type },
    
                    method: 'GET',
    
                    success(prices){
                        dataFromOtherRequest.prices = prices;
                        next(dataFromOtherRequest);
                    },
    
                    failure(err){
                        stop(err);
                    }
                });
    
            }).then(function(next, stop, dataFromOtherRequest){
    
                $.ajax({
                    url:    "product/images"
                    
                    data:   data,
    
                    method: 'GET',
    
                    success(images){
                        dataFromOtherRequest.images = images;
                        next(dataFromOtherRequest);
                    },
    
                    failure(err){
                        stop(err)
                    }
                });
    
            });
        }
    };
    
    dao.getProduct({ code: 1000 }).then((go, dontgo, data) => {
    
        // display data in screen or anothor stuff
    
    }).catch(e => {
        alert(e.message);
    });