var app = angular.module('myApp', []);

app.controller('iSclController', ['$scope', '$timeout', function($scope, $timeout) {
    $scope.getFirstList = function(add) {
        $timeout(function() {
            if (add) {
                $scope.list1 = $scope.list1.concat([{ id: 6 }, { id: 7 }]);
            } else {
                //$scope.list1 = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
                $scope.list1 = [];
            }
        }, 1000)
    }
    $scope.getSecondList = function(add, cbk) {
        $timeout(function() {
            if (add) {
                //$scope.list2 = $scope.list2.concat([{ id: '六' }, { id: '七' }]);
                cbk(); //下一页没有数据
            } else {
                $scope.list2 = [{ id: '零' }, { id: '一' }, { id: '二' }, { id: '三' }, { id: '四' }, { id: '五' }, { id: '十' }];
            }
        }, 1000)
    }
    $scope.iscroll = {
        pullDownAction: function() {
            if (!$scope.showStatus) {
                $scope.getFirstList();
            } else {
                $scope.getSecondList();
            }
        },
        pullUpAction: function(cbk) {
            //cbk 回调方法
            if (!$scope.showStatus) {
                $scope.getFirstList(true, cbk);
            } else {
                $scope.getSecondList(true, cbk);
            }
        }
    }
    $scope.$watch('showStatus', function(newVal) {
        if (!newVal) {
            $scope.getFirstList();
        } else {
            $scope.getSecondList();
        }
        if ($scope.iscroll.refresh) {
            $scope.iscroll.refresh();
        }
    });
}])

app.directive('angularScroll', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attr) {
            var iscroll = scope.$parent[attr[this.name]];
            if (!iscroll.init) {
                var iscrollId = '#' + attr['scrollId'];
                scope.pullDownAction = function() {
                    iscroll.pullDownAction();
                }
                scope.pullUpAction = function() {
                    iscroll.pullUpAction(function() {
                        iscroll.iscrollObj.pullUpEl.querySelector('.pullUpLabel').innerHTML = '没有数据';
                        $timeout(function() {
                            iscroll.refresh();
                        }, 500)
                    });
                }
                var addEme = angular.element(document.querySelector(iscrollId).children[0]).eq(0);
                addEme.prepend('<div id="pullDown" class="ng-hide"><div class="pullDownIcon"></div><div class="pullDownLabel">下拉刷新</div></div>');
                addEme.append('<div id="pullUp" class="ng-hide"><div class="pullUpIcon"></div><div class="pullUpLabel">上拉显示更多...</div></div>');
                iscroll.iscrollObj = {
                    myScroll: null,
                    pullDownEl: document.getElementById('pullDown'),
                    pullUpEl: document.getElementById('pullUp'),
                    'init': function() {
                        this.loaded();
                    },
                    'loaded': function() {
                        this.myScroll = new IScroll(iscrollId, {
                            probeType: 2, //probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。  
                            scrollbars: true, //有滚动条  
                            mouseWheel: false, //允许滑轮滚动  
                            fadeScrollbars: true, //滚动时显示滚动条，默认影藏，并且是淡出淡入效果  
                            bounce: true, //边界反弹  
                            interactiveScrollbars: false, //滚动条可以拖动  
                            shrinkScrollbars: 'scale', // 当滚动边界之外的滚动条是由少量的收缩。'clip' or 'scale'.  
                            click: true, // 允许点击事件  
                            keyBindings: true, //允许使用按键控制  
                            momentum: true, // 允许有惯性滑动  ,
                        });
                        //滚动时  
                        var self = this;
                        this.myScroll.on('scroll', function() {
                            if (this.y > 5 && !self.pullDownEl.className.match('flip')) {
                                self.pullDownEl.className = 'flip';
                                self.pullDownEl.querySelector('.pullDownLabel').innerHTML = '松开刷新...';
                                this.minScrollY = 0;
                            } else if (this.y < (this.maxScrollY - 5) && !self.pullUpEl.className.match('flip')) {
                                self.pullUpEl.className = 'flip';
                                self.pullUpEl.querySelector('.pullUpLabel').innerHTML = '松开刷新...';
                                this.maxScrollY = this.maxScrollY;
                                self.myScroll.refresh();
                            }
                        });
                        //滚动完毕  
                        this.myScroll.on('scrollEnd', function() {
                            if (self.pullDownEl.className.match('flip')) {
                                self.pullDownEl.className = 'loading';
                                self.pullDownEl.querySelector('.pullDownLabel').innerHTML = '加载...';
                                scope.pullDownAction(); // Execute custom function (ajax call?)
                            } else if (self.pullUpEl.className.match('flip')) {
                                self.pullUpEl.className = 'loading';
                                self.pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载...';
                                scope.pullUpAction(); // Execute custom function (ajax call?)
                            }
                        });
                    }
                }
                iscroll.iscrollObj.init();
                iscroll.refresh = function() {
                    $timeout(function() {
                        iscroll.iscrollObj.pullUpEl.className = iscroll.iscrollObj.pullDownEl.className = 'ng-hide';
                        iscroll.iscrollObj.myScroll.refresh();
                    })

                };
                iscroll.init = true;
            }
            if (scope.$parent.$last === true) {
                iscroll.refresh();
            }
        }
    };
}]).directive('scrollRepeat', function() {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attr) {
            var obj = scope.$parent[attr[this.name]];
            scope.$parent.$watch(attr[this.name], function(newVal) {
                if (!newVal) {
                    if (angular.element(element[0]).next('.loader').length < 1) {
                        angular.element(element[0]).after('<div class="loader"><div class="line-scale"><div></div><div></div><div></div><div></div><div></div></div><div style="margin-top:15px">加载中...</div></div>');
                    } else {
                        angular.element(element[0]).next('.loader').removeClass('ng-hide');
                    }
                }
                if (newVal && newVal.length > 0) {
                    angular.element(element[0]).children('.no-data').remove();
                    if (angular.element(element[0]).next('.loader').length > 0) {
                        angular.element(element[0]).next('.loader').addClass('ng-hide');
                    }
                }
                if (newVal && newVal.length == 0) {
                    if (angular.element(element[0]).children('.no-data').length == 0) {
                        angular.element(element[0]).append('<li class="no-data">没有数据</li>');
                    }

                    angular.element(element[0]).next('.loader').addClass('ng-hide');
                }
            })

        }
    }
})