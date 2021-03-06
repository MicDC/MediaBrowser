﻿(function (window, $) {

    var currentDialogOptions;

    function submitJob(userId, syncOptions, form) {

        if (!userId) {
            throw new Error('userId cannot be null');
        }

        if (!syncOptions) {
            throw new Error('syncOptions cannot be null');
        }

        if (!form) {
            throw new Error('form cannot be null');
        }

        var target = $('#selectSyncTarget', form).val();

        if (!target) {

            Dashboard.alert(Globalize.translate('MessagePleaseSelectDeviceToSyncTo'));
            return;
        }

        var options = {

            userId: userId,
            TargetId: target,

            ParentId: syncOptions.ParentId,
            Category: syncOptions.Category
        };

        setJobValues(options, form);

        if (syncOptions.items && syncOptions.items.length) {
            options.ItemIds = (syncOptions.items || []).map(function (i) {
                return i.Id || i;
            }).join(',');
        }

        ApiClient.ajax({

            type: "POST",
            url: ApiClient.getUrl("Sync/Jobs"),
            data: JSON.stringify(options),
            contentType: "application/json"

        }).done(function () {

            $('.syncPanel').panel('close');
            $(window.SyncManager).trigger('jobsubmit');
            Dashboard.alert(Globalize.translate('MessageSyncJobCreated'));
        });
    }

    function setJobValues(job, form) {

        var bitrate = $('#txtBitrate', form).val() || null;

        if (bitrate) {
            bitrate = parseFloat(bitrate) * 1000000;
        }

        job.Name = $('#txtSyncJobName', form).val();
        job.Quality = $('#selectQuality', form).val() || null;
        job.Profile = $('#selectProfile', form).val() || null;
        job.Bitrate = bitrate;
        job.ItemLimit = $('#txtItemLimit', form).val() || null;
        job.SyncNewContent = $('#chkSyncNewContent', form).checked();
        job.UnwatchedOnly = $('#chkUnwatchedOnly', form).checked();
    }

    function renderForm(options) {

        var elem = options.elem;
        var dialogOptions = options.dialogOptions;

        var targets = dialogOptions.Targets;

        var html = '';

        if (options.showName || dialogOptions.Options.indexOf('Name') != -1) {

            html += '<p>';
            html += '<label for="txtSyncJobName">' + Globalize.translate('LabelSyncJobName') + '</label>';
            html += '<input type="text" id="txtSyncJobName" class="txtSyncJobName" required="required" />';
            html += '</p>';
        }

        html += '<div>';
        html += '<label for="selectSyncTarget">' + Globalize.translate('LabelSyncTo') + '</label>';
        if (options.readOnlySyncTarget) {
            html += '<input type="text" id="selectSyncTarget" readonly="readonly" />';
        } else {
            html += '<select id="selectSyncTarget" required="required" data-mini="true">';

            html += targets.map(function (t) {

                return '<option value="' + t.Id + '">' + t.Name + '</option>';

            }).join('');
            html += '</select>';
            if (!targets.length) {
                html += '<div class="fieldDescription">' + Globalize.translate('LabelSyncNoTargetsHelp') + '</div>';
                html += '<div class="fieldDescription"><a href="https://github.com/MediaBrowser/Wiki/wiki/Sync" target="_blank">' + Globalize.translate('ButtonLearnMore') + '</a></div>';
            }
        }
        html += '</div>';

        html += '<div class="fldProfile" style="display:none;">';
        html += '<br/>';
        html += '<label for="selectProfile">' + Globalize.translate('LabelProfile') + '</label>';
        html += '<select id="selectProfile" data-mini="true">';
        html += '</select>';
        html += '<div class="fieldDescription profileDescription"></div>';
        html += '</div>';

        html += '<div class="fldQuality" style="display:none;">';
        html += '<br/>';
        html += '<label for="selectQuality">' + Globalize.translate('LabelQuality') + '</label>';
        html += '<select id="selectQuality" data-mini="true" required="required">';
        html += '</select>';
        html += '<div class="fieldDescription qualityDescription"></div>';
        html += '</div>';

        html += '<div class="fldBitrate" style="display:none;">';
        html += '<br/>';
        html += '<div>';
        html += '<label for="txtBitrate">' + Globalize.translate('LabelBitrateMbps') + '</label>';
        html += '<input type="number" id="txtBitrate" step=".1" min=".1" />';
        html += '</div>';
        html += '</div>';

        if (dialogOptions.Options.indexOf('SyncNewContent') != -1) {
            html += '<br/>';
            html += '<div>';
            html += '<label for="chkSyncNewContent">' + Globalize.translate('OptionAutomaticallySyncNewContent') + '</label>';
            html += '<input type="checkbox" id="chkSyncNewContent" data-mini="true" checked="checked" />';
            html += '<div class="fieldDescription">' + Globalize.translate('OptionAutomaticallySyncNewContentHelp') + '</div>';
            html += '</div>';
        }

        if (dialogOptions.Options.indexOf('UnwatchedOnly') != -1) {
            html += '<br/>';
            html += '<div>';
            html += '<label for="chkUnwatchedOnly">' + Globalize.translate('OptionSyncUnwatchedVideosOnly') + '</label>';
            html += '<input type="checkbox" id="chkUnwatchedOnly" data-mini="true" />';
            html += '<div class="fieldDescription">' + Globalize.translate('OptionSyncUnwatchedVideosOnlyHelp') + '</div>';
            html += '</div>';
        }

        if (dialogOptions.Options.indexOf('ItemLimit') != -1) {
            html += '<br/>';
            html += '<div>';
            html += '<label for="txtItemLimit">' + Globalize.translate('LabelItemLimit') + '</label>';
            html += '<input type="number" id="txtItemLimit" step="1" min="1" />';
            html += '<div class="fieldDescription">' + Globalize.translate('LabelItemLimitHelp') + '</div>';
            html += '</div>';
        }

        //html += '</div>';
        //html += '</div>';

        $(elem).html(html).trigger('create');

        $('#selectSyncTarget', elem).on('change', function () {

            loadQualityOptions(elem, this.value, options.dialogOptionsFn);

        }).trigger('change');

        $('#selectProfile', elem).on('change', function () {

            onProfileChange(elem, this.value);

        }).trigger('change');

        $('#selectQuality', elem).on('change', function () {

            onQualityChange(elem, this.value);

        }).trigger('change');

    }

    function showSyncMenu(options) {

        var userId = Dashboard.getCurrentUserId();

        var dialogOptionsQuery = {
            UserId: userId,
            ItemIds: (options.items || []).map(function (i) {
                return i.Id || i;
            }).join(','),

            ParentId: options.ParentId,
            Category: options.Category
        };

        ApiClient.getJSON(ApiClient.getUrl('Sync/Options', dialogOptionsQuery)).done(function (dialogOptions) {

            currentDialogOptions = dialogOptions;

            var html = '<div data-role="panel" data-position="right" data-display="overlay" class="syncPanel" data-position-fixed="true" data-theme="a">';

            html += '<div>';

            html += '<form class="formSubmitSyncRequest">';

            html += '<div style="margin:1em 0 1.5em;">';
            html += '<h1 style="margin: 0;display:inline-block;vertical-align:middle;">' + Globalize.translate('SyncMedia') + '</h1>';
            html += '<a class="accentButton accentButton-g" style="display:inline-block;vertical-align:middle;margin-top:0;margin-left: 20px;" href="https://github.com/MediaBrowser/Wiki/wiki/Sync" target="_blank">';
            html += '<i class="fa fa-info-circle"></i>';
            html += Globalize.translate('ButtonHelp');
            html += '</a>';
            html += '</div>';

            html += '<div class="formFields"></div>';

            html += '<br/>';
            html += '<p>';
            html += '<button type="submit" data-icon="cloud" data-theme="b">' + Globalize.translate('ButtonSync') + '</button>';
            html += '</p>';

            html += '</form>';
            html += '</div>';
            html += '</div>';

            $(document.body).append(html);

            var elem = $('.syncPanel').panel({}).trigger('create').panel("open").on("panelclose", function () {
                $(this).off("panelclose").remove();
            });

            $('form', elem).on('submit', function () {

                submitJob(userId, options, this);
                return false;
            });

            renderForm({
                elem: $('.formFields', elem),
                dialogOptions: dialogOptions,
                dialogOptionsFn: getTargetDialogOptionsFn(dialogOptionsQuery)
            });
        });
    }

    function getTargetDialogOptionsFn(query) {

        return function (targetId) {

            query.TargetId = targetId;
            return ApiClient.getJSON(ApiClient.getUrl('Sync/Options', query));
        };
    }

    function onProfileChange(form, profileId) {

        var options = currentDialogOptions || {};
        var option = (options.ProfileOptions || []).filter(function (o) {
            return o.Id == profileId;
        })[0];

        if (option) {
            $('.profileDescription', form).html(option.Description || '');
            setQualityFieldVisible(form, options.QualityOptions.length > 0 && option.EnableQualityOptions && options.Options.indexOf('Quality') != -1);
        } else {
            $('.profileDescription', form).html('');
            setQualityFieldVisible(form, options.QualityOptions.length > 0 && options.Options.indexOf('Quality') != -1);
        }
    }

    function onQualityChange(form, qualityId) {

        var options = currentDialogOptions || {};
        var option = (options.QualityOptions || []).filter(function (o) {
            return o.Id == qualityId;
        })[0];

        if (option) {
            $('.qualityDescription', form).html(option.Description || '');
        } else {
            $('.qualityDescription', form).html('');
        }

        if (qualityId == 'custom') {
            $('.fldBitrate', form).show();
            $('#txtBitrate', form).attr('required', 'required');
        } else {
            $('.fldBitrate', form).hide();
            $('#txtBitrate', form).removeAttr('required').val('');
        }
    }

    function loadQualityOptions(form, targetId, dialogOptionsFn) {

        dialogOptionsFn(targetId).done(function (options) {

            renderTargetDialogOptions(form, options);
        });
    }

    function setQualityFieldVisible(form, visible) {

        if (visible) {
            $('.fldQuality', form).show();
            $('#selectQuality', form).attr('required', 'required');
        } else {
            $('.fldQuality', form).hide();
            $('#selectQuality', form).removeAttr('required');
        }
    }

    function renderTargetDialogOptions(form, options) {

        currentDialogOptions = options;

        if (options.ProfileOptions.length && options.Options.indexOf('Profile') != -1) {
            $('.fldProfile', form).show();
            $('#selectProfile', form).attr('required', 'required');
        } else {
            $('.fldProfile', form).hide();
            $('#selectProfile', form).removeAttr('required');
        }

        setQualityFieldVisible(options.QualityOptions.length > 0);

        $('#selectProfile', form).html(options.ProfileOptions.map(function (o) {

            var selectedAttribute = o.IsDefault ? ' selected="selected"' : '';
            return '<option value="' + o.Id + '"' + selectedAttribute + '>' + o.Name + '</option>';

        }).join('')).trigger('change').selectmenu('refresh');

        $('#selectQuality', form).html(options.QualityOptions.map(function (o) {

            var selectedAttribute = o.IsDefault ? ' selected="selected"' : '';
            return '<option value="' + o.Id + '"' + selectedAttribute + '>' + o.Name + '</option>';

        }).join('')).trigger('change').selectmenu('refresh');
    }

    function isAvailable(item, user) {

        return item.SupportsSync;
    }

    window.SyncManager = {

        showMenu: showSyncMenu,
        isAvailable: isAvailable,
        renderForm: renderForm,
        setJobValues: setJobValues
    };

    function showSyncButtonsPerUser(page) {

        var apiClient = ConnectionManager.currentApiClient();

        if (!apiClient) {
            return;
        }

        Dashboard.getCurrentUser().done(function (user) {

            if (user.Policy.EnableSync) {
                $('.categorySyncButton', page).show();
            } else {
                $('.categorySyncButton', page).hide();
            }

        });
    }

    function onCategorySyncButtonClick(page, button) {

        var category = button.getAttribute('data-category');
        var parentId = LibraryMenu.getTopParentId();

        SyncManager.showMenu({
            ParentId: parentId,
            Category: category
        });
    }

    $(document).on('pageinit', ".libraryPage", function () {

        var page = this;

        $('.categorySyncButton', page).on('click', function () {

            onCategorySyncButtonClick(page, this);
        });

    }).on('pagebeforeshow', ".libraryPage", function () {

        var page = this;

        showSyncButtonsPerUser(page);

    });


})(window, jQuery);