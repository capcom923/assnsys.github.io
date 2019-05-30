define(['angular', 'echarts'], function (angular, echarts) {

    var app = angular.module('correlation.app', [
        'ui.bootstrap',
    ], angular.noop);

    app.config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
        app.tools = app.tools || {};

        app.tools.register = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service,
            provider: $provide.provider
        }
    }]);

    app.factory('modelView', ['$uibModal', '$window', function ($uibModal, $window) {
        var dlg_handle = {
            ok_cancel: function ($scope, service, action, oncancel) {
                $scope.params = $scope.params || {};

                var do_ok = function () {
                    if (angular.isFunction(action)) {
                        return action.call(service, $scope.params);
                    }

                    return true;
                }

                $scope.cancel = function () {
                    $scope.$dismiss({ $value: 'cancel' });
                    if (angular.isFunction(oncancel)) {
                        oncancel.call(service, $scope.params);
                    }
                };

                $scope.ok = function () {
                    // Process ok.
                    var res = do_ok();

                    if (typeof res === 'boolean' && res) {
                        // successfully handled, close the dialog
                        $scope.$close(true);
                    } else if (angular.isPromise(res)) {
                        res.then(function (resp) {
                            if (resp && resp.status && !resp.status.succeed) {
                                $scope.errmsg = resp;
                                log_error(JSON.stringify(resp));
                            } else {
                                $scope.$close(true);
                            }
                        }, function (resp) {
                            $scope.errmsg = resp;
                            log_error(JSON.stringify(resp));
                        })
                    } else {
                        $scope.errmsg = res;
                        if (res) {
                            log_error(JSON.stringify(res));
                        }
                    }
                };
            },
            init: function (settings, setting) {
                if (setting.size) {
                    settings.size = setting.size;
                }

                settings.dialog = $uibModal.open(settings);
                settings.dialog.result.then(function (confirmed) {
                }, function (resp) {
                })
            }
        }

        var mv = {
            animationsEnabled: true,

            hyperinfo: function (title, url, setting) {
                setting = setting || {};

                var settings = {
                    ariaLabelledBy: 'modal-title-app-hyperinfo',
                    ariaDescribedBy: 'modal-body-app-hyperinfo',
                    templateUrl: 'app-hyperinfo-dialog-template',

                    backdrop: false,
                    animation: mv.animationsEnabled,
                    windowTemplateUrl: "uib-template-modal-window-template",

                    //size: 'sm',
                    controller: ['$scope', function ($scope) {
                        $scope.$setting = setting;
                        $scope.title = title;
                        $scope.url = url;

                        $scope.ok = function () {
                            $scope.$close(true);
                        }
                    }]
                };

                dlg_handle.init(settings, setting);
            },

            alert: function (title, major, setting) {
                setting = setting || {};

                var settings = {
                    ariaLabelledBy: 'modal-title-app-alert',
                    ariaDescribedBy: 'modal-body-app-alert',
                    templateUrl: 'app-alert-dialog-template',

                    backdrop: false,
                    animation: mv.animationsEnabled,
                    windowTemplateUrl: "uib-template-modal-window-template",

                    //size: 'sm',
                    controller: ['$scope', function ($scope) {
                        $scope.$setting = setting;
                        $scope.major = major;
                        $scope.title = title;

                        $scope.ok = function () {
                            $scope.$close(true);
                        }
                    }]
                };

                dlg_handle.init(settings, setting);
            },

            prompt: function (title, major, minor, setting, service, action, oncancel) {
                setting = setting || {};

                var settings = {
                    ariaLabelledBy: 'modal-title-app-prompt',
                    ariaDescribedBy: 'modal-body-app-prompt',
                    templateUrl: 'app-prompt-dialog-template',

                    backdrop: false,
                    animation: mv.animationsEnabled,
                    windowTemplateUrl: "uib-template-modal-window-template",

                    //size: 'sm',
                    controller: ['$scope', function ($scope) {
                        angular.extend($scope, service);
                        $scope.$setting = setting;
                        $scope.major = major;
                        $scope.minor = minor;
                        $scope.title = title;

                        dlg_handle.ok_cancel($scope, service, action, oncancel);
                    }]
                };

                dlg_handle.init(settings, setting);
            },

            prompt_input: function (title, major, setting, service, action, oncancel) {
                setting = setting || {};

                var settings = {
                    ariaLabelledBy: 'modal-title-app-prompt-input',
                    ariaDescribedBy: 'modal-body-app-prompt-input',
                    templateUrl: 'app-prompt-dialog-input-template',

                    backdrop: false,
                    animation: mv.animationsEnabled,
                    windowTemplateUrl: "uib-template-modal-window-template",

                    //size: 'sm',
                    controller: ['$scope', function ($scope) {
                        angular.extend($scope, service);
                        $scope.$setting = setting;
                        $scope.major = major;
                        $scope.title = title;

                        dlg_handle.ok_cancel($scope, service, action, oncancel);
                    }]
                };

                dlg_handle.init(settings, setting);
            },

            domodal: function (title, view_template, setting, service, action, form, nofooter, oncancel) {
                setting = setting || {};

                var settings = {
                    ariaDescribedBy: 'modal-body-app-modal',
                    ariaLabelledBy: 'modal-title-app-modal',
                    templateUrl: 'app-modal' + (form ? '-form' : '') + '-dialog-template',

                    backdrop: false,
                    appendTo: undefined, //angular.element($window.document),windowClass: 'testclass',
                    animation: mv.animationsEnabled,
                    windowTemplateUrl: "uib-template-modal-window-template",

                    controller: ['$scope', function ($scope) {
                        angular.extend($scope, service);
                        $scope.template = view_template;
                        $scope.$setting = setting;
                        $scope.errmsg = null;
                        $scope.params = {};

                        $scope.nofooter = nofooter;
                        $scope.angular = angular;
                        $scope.Object = Object;
                        $scope.title = title;
                        $scope.form = form;
                        $scope.$ = $;

                        dlg_handle.ok_cancel($scope, service, action, oncancel);
                    }]
                };

                dlg_handle.init(settings, setting);
            }
        };

        angular.element(document).injector().invoke(['$rootScope', function ($rootScope) {
            $rootScope.$broadcast('app-model-view', mv);
        }]);

        return mv;
    }]);

    app.directive('correlationMap', function () {
        return {
            scope: true,
            priority: 450,
            restrict: 'A',
            compile: function (element, attr) {
                return function (scope, element, attrs, ctrl, $transclude) {
                    scope.rules = scope.$eval(attrs.rules);
                    var echart = echarts.init(element[0]);

                    scope.$watch('rules.showLoading', function (showLoading) {
                        if (showLoading) {
                            echart.showLoading();
                        } else {
                            echart.hideLoading();
                        }

                    });

                    scope.$watch('rules.corMap', function (corMap) {
                        if (!corMap) {
                            echart.showLoading();
                            return;
                        };

                        var optionMap = {
                            tooltip: {
                                textStyle: {
                                    align: 'left'
                                },
                                formatter: function (params) {
                                    var param = typeof (params) == 'array' ? params[0] : params;

                                    function build_node_tip(node, marker) {
                                        node.marker = marker || node.marker;

                                        var device = node ? corMap.devices[node.device] : null;
                                        var category = node ? corMap.categories[node.category] : null;

                                        var res = '<div><h3 style="margin: 5px 0px;">' + ((category && category.name) || '') + '</h3></div>';
                                        res += '<div>' + (node.marker || '') + '<span>' + (device ? device.name + ":" : "") + node.name + ':' + node.pointId + '</span></div>'
                                        return '<span style="display:inline-block;">' + res + '</span>';
                                    }

                                    if (param.dataType == "node") {
                                        return build_node_tip(corMap.nodes[param.data.id], param.marker);
                                    }

                                    if (param.dataType == "edge") {
                                        var source_node = corMap.nodes[param.data.source];
                                        var target_node = corMap.nodes[param.data.target];

                                        var source_res = build_node_tip(source_node);
                                        var target_res = build_node_tip(target_node);

                                        return '<div>' + source_res + '<span style="display:inline-block; margin: auto 10px; vertical-align: top;"><p> >>> </p></span>' + target_res + '</div>';
                                    }

                                    return '';
                                },
                                trigger: 'item'
                            },
                            animationDuration: 1500,
                            animationEasingUpdate: 'quinticInOut',
                            legend: [{
                                left: 0,
                                top: "middle",
                                align: "left",
                                orient: "vertical",
                                data: corMap.categories.map(function (obj) {
                                    return obj.name;
                                })
                            }],
                            series: [{
                                z: 1,
                                zlevel: 1,
                                type: 'pie',
                                roseType: 'area',
                                radius: ["2%", "20%"],
                                center: ['85%', '15%'],
                                avoidLabelOverlap: true,
                                backgroundColor: "#000515",

                                data: [
                                    { value: corMap.stats.groups.length, name: '关联组:' + corMap.stats.groups.length },
                                    { value: corMap.stats.crsys_groups, name: '跨子系统组:' + corMap.stats.crsys_groups },
                                    { value: corMap.stats.max_node_count, name: '最大点位数:' + corMap.stats.max_node_count },
                                    { value: corMap.stats.max_power, name: '最大关联强度:' + corMap.stats.max_power },
                                ]
                            }, {
                                //edgeSymbol: ['circle', 'arrow'],
                                focusNodeAdjacency: true,
                                hoverAnimation: true,
                                animation: false,
                                draggable: true,
                                symbol: "circle",
                                layout: 'force',
                                type: 'graph',
                                roam: true,
                                zlevel: 0,
                                z: 0,

                                lineStyle: {
                                    normal: {
                                        //curveness: 0.3
                                    }
                                },
                                label: {
                                    normal: {
                                        show: false,
                                        position: 'right',
                                        formatter: function (params) {
                                            var param = typeof (params) == 'array' ? params[0] : params;
                                            var node = corMap.nodes[param.data.id];
                                            node.marker = param.marker;
                                            node.color = param.color;
                                            return null;
                                        }
                                    }
                                },
                                data: corMap.nodes,
                                categories: corMap.categories.map(function (cat) {
                                    cat.symbol = "circle";
                                    return cat;
                                }),
                                force: {
                                    initLayout: 'circular',
                                    layoutAnimation: true,
                                    repulsion: [50, 200],
                                    edgeLength: [10, 50],
                                    gravity: 1.0
                                },
                                edges: corMap.links,
                            }]
                        };

                        echart.setOption(optionMap);
                        echart.hideLoading();

                        echart.on('click', function (param) {
                            if (param.dataType == "node") {
                                var new_node = corMap.nodes[param.data.id];

                                if (typeof scope.rules.mapNodeClicked == 'function') {
                                    scope.rules.mapNodeClicked(new_node);
                                }
                            }
                        })
                    })

                }
            }
        }
    })

    app.directive('correlationTree', function () {
        return {
            scope: true,
            priority: 450,
            restrict: 'A',
            compile: function (element, attr) {
                return function (scope, element, attrs, ctrl, $transclude) {
                    scope.rules = scope.$eval(attrs.rules);
                    var echart = echarts.init(element[0]);

                    scope.$watch('rules.showLoading', function (showLoading) {
                        if (showLoading) {
                            echart.showLoading();
                        } else {
                            echart.hideLoading();
                        }
                    });

                    var series_tree = null;
                    scope.$watch('rules.corMap', function (corMap) {
                        if (!corMap) {
                            echart.showLoading();
                            series_tree = null;
                            return;
                        }

                        series_tree = {
                            type: 'tree',

                            data: [

                            ],

                            itemStyle: {
                                borderWidth: 3,
                                color: "#515b67",
                                borderColor: "#0098ff"
                            },

                            dataFormater: function (data) {
                                var node = corMap.nodes[data.dataId];

                                data.itemStyle = {
                                    borderColor: node.color
                                }
                            },

                            lineStyle: {
                                color: "#0098ff",
                                curveness: "0.8",
                                width: "1"
                            },

                            label: {
                                normal: {
                                    fontSize: 9,
                                    distance: 5,
                                    align: "left",
                                    position: "right",
                                    verticalAlign: "middle",
                                    padding: [0, 0, 0, 0],

                                    formatter: function (dat) {
                                        var data = dat.data;
                                        var category = data ? corMap.categories[data.category] : null;
                                        var device = data ? corMap.devices[data.device] : null;
                                        var catname = (category && category.name) || '';

                                        if (catname) {
                                            return ["{ignornormal|" + catname + ":}", "{normal|" + (device ? device.name + ":" : "") + data.name + ":" + data.pointId + "}"];
                                        }

                                        return ["{ignornormal|" + catname + ":}", "{abnormal|" + (device ? device.name + ":" : "") + data.name + ":" + data.pointId + "}"];
                                    },

                                    rich: {
                                        ignornormal: {
                                            fontSize: 12,
                                            color: "#d0d9e8",
                                            padding: [0, 5, 0, 0]
                                        },

                                        normal: {
                                            align: "center",
                                            color: "#d0d9e8"
                                        },

                                        abnormal: {
                                            width: "3",
                                            height: "14",
                                            align: "center",
                                            color: "yellow",
                                            backgroundColor: "rgba(245,48,8,0.5)"
                                        }
                                    }
                                }
                            },

                            leaves: {
                                label: {
                                    normal: {
                                        distance: 5,
                                        fontSize: 12,
                                        align: "left",
                                        position: "right",
                                        padding: [0, 0, 0, 0],
                                        verticalAlign: "middle"
                                    }
                                }
                            },

                            roam: true,
                            orient: "LR",
                            symbolSize: 17,
                            initialTreeDepth: 2,
                            layout: "orthogonal",
                            animationDuration: 550,
                            expandAndCollapse: true,
                            animationDurationUpdate: 750
                        };

                        var optionTree = {
                            backgroundColor: "#000515",
                            tooltip: {
                                textStyle: {
                                    align: 'left'
                                },
                                formatter: function (params) {
                                    var param = typeof (params) == 'array' ? params[0] : params;

                                    function build_node_tip(node) {
                                        var category = node ? corMap.categories[node.category] : null;
                                        var res = '<div><h3 style="margin: 5px 0px;">' + ((category && category.name) || '') + '</h3></div>';
                                        res += '<div>' + (node.marker || '') + '<span>' + node.name + ':' + node.value + '</span></div>'
                                        return '<span style="display:inline-block;">' + res + '</span>';
                                    }

                                    if (param.dataType == "main") {
                                        return build_node_tip(corMap.nodes[param.data.dataId]);
                                    }

                                    return '';
                                },
                                trigger: 'item'
                            },
                            series: [
                                series_tree
                            ]
                        };

                        echart.setOption(optionTree);
                        echart.hideLoading();
                    })

                    scope.$watch('rules.currentMapNode', function (new_node) {

                        if (!series_tree || new_node == series_tree.data || (typeof series_tree.data == 'array' && series_tree.data.indexOf(new_node) >= 0)) {
                            return;
                        }

                        series_tree.data = function () {
                            return new_node ? [new_node] : [];
                        };

                        echart.setOption({
                            series: series_tree
                        });
                    })

                }
            }
        }
    })

    app.controller('correlationApp', ['$scope', '$rootScope', '$http', '$interval', 'modelView', function ($scope, $rootScope, $http, $interval, modelView) {

        $scope.corRules = {
            currentMapNode: null,
            showLoading: true,
            corMap: null,
        };

        function extend(target, source) {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
            return target;
        }

        //$http.post('datas/correlation-map', {
        $http.post('https://capcom.southeastasia.cloudapp.azure.com:8443/correlation-map?minConfidence=0.7&isOnlyCrossCategory=false', {
        }, {
                headers: {
                    "Account": '****',
                    "Product": 'site2',
                    "Content-Type": 'application/json',
                }
            }).then(function (corMap) {

                corMap = corMap.data;

                if (typeof corMap == 'string') {
                    corMap = JSON.parse(corMap);
                }

                $interval(function () {
                    corMap.stats = {
                        groups: [],
                        solo: {}
                    }

                    corMap.nodes = corMap.nodes.map(function (node, idx) {
                        node.id = idx;
                        return node;
                    })

                    corMap.links.forEach(function (link) {
                        var src_node = corMap.nodes[link.source];
                        var dst_node = corMap.nodes[link.target];

                        // build up the groups
                        if (!src_node.group) {
                            if (dst_node.group) {
                                src_node.group = dst_node.group;
                            } else {
                                src_node.group = {
                                    edge_count: 0,
                                    node_count: 0,
                                    tightness: 0,
                                    nodes: {},
                                    sys: {},
                                };

                                corMap.stats.groups.push(src_node.group);
                            }
                        }

                        var group = src_node.group;
                        if (!dst_node.group) {
                            dst_node.group = group;
                        } else if (group != dst_node.group) {
                            var didx = corMap.stats.groups.indexOf(dst_node.group);
                            group.edge_count += dst_node.group.edge_count;
                            extend(group.nodes, dst_node.group.nodes);
                            extend(group.sys, dst_node.group.sys);

                            if (didx >= 0) {
                                corMap.stats.groups.splice(didx, 1);
                            } else {
                                alert('invalid index of group to be removed');
                            }

                            for (var key in dst_node.group.nodes) {
                                if (dst_node.group.nodes.hasOwnProperty(key)) {
                                    dst_node.group.nodes[key].group = group;
                                }
                            }
                        }

                        group.nodes['' + src_node.id] = src_node;
                        group.nodes['' + dst_node.id] = dst_node;

                        if (corMap.categories && corMap.categories[src_node.category]) {
                            group.sys['' + src_node.category] = corMap.categories[src_node.category];
                        }

                        if (corMap.categories && corMap.categories[dst_node.category]) {
                            group.sys['' + dst_node.category] = corMap.categories[dst_node.category];
                        }

                        group.edge_count += 1;

                        // build up the node map.
                        if (src_node && dst_node && src_node != dst_node) {
                            src_node.children = src_node.children || (function () {
                                var children = [];

                                return function () {
                                    return children;
                                }
                            }());

                            var children = src_node.children();
                            if (children.indexOf(dst_node) < 0) {
                                children.push(dst_node);
                            }
                        }
                    });

                    corMap.stats.max_power = 0;
                    corMap.stats.max_tightness = 0;
                    corMap.stats.max_node_count = 0;
                    corMap.stats.crsys_groups = 0;

                    corMap.stats.groups.sort(function (g1, g2) {
                        g1.node_count = g1.node_count || Object.getOwnPropertyNames(g1.nodes).length;
                        g2.node_count = g2.node_count || Object.getOwnPropertyNames(g2.nodes).length;
                        g1.sys_count = g1.sys_count || Object.getOwnPropertyNames(g1.sys).length;
                        g2.sys_count = g2.sys_count || Object.getOwnPropertyNames(g2.sys).length;

                        g1.tightness = g1.tightness || Math.round(100 * (g1.edge_count / (g1.node_count * (g1.node_count - 1))));
                        g2.tightness = g2.tightness || Math.round(100 * (g2.edge_count / (g2.node_count * (g2.node_count - 1))));
                        corMap.stats.max_node_count = Math.max(corMap.stats.max_node_count, g1.node_count);
                        corMap.stats.max_node_count = Math.max(corMap.stats.max_node_count, g2.node_count);
                        corMap.stats.max_tightness = Math.max(corMap.stats.max_tightness, g1.tightness);
                        corMap.stats.max_tightness = Math.max(corMap.stats.max_tightness, g2.tightness);

                        return g2.node_count - g1.node_count;
                    });

                    corMap.nodes.forEach(function (node) {
                        if (node.group) {
                            var gidx = corMap.stats.groups.indexOf(node.group);

                            if (gidx >= 0) {
                                node.group = gidx;
                            } else {
                                alert('error during node group building');
                            }
                        } else {
                            corMap.stats.solo = corMap.stats.solo || {};
                            corMap.stats.solo['' + node.id] = node;
                        }
                    })

                    corMap.stats.groups.forEach(function (g) {
                        g.power = Math.round(100 * (g.node_count / corMap.stats.max_node_count) * (g.tightness / corMap.stats.max_tightness));
                        corMap.stats.crsys_groups += (Object.getOwnPropertyNames(g.sys).length > 1 ? 1 : 0);
                        corMap.stats.max_power = Math.max(corMap.stats.max_power, g.power);
                    })

                    $scope.corRules.corMap = corMap;
                    $scope.corRules.showLoading = false;
                }, 0, 1, true);

            }, function (data) {

            });

        $scope.corRules.mapNodeClicked = function (node) {
            $interval(function () {
                $scope.corRules.currentMapNode = node;

                modelView.domodal(
                    'correlation tree',
                    'correlation-tree-dialog', {
                        nocancel: true,
                    }, { corRules: $scope.corRules }
                );

            }, 0, 1, true);
        }

    }]);

    return app;
});