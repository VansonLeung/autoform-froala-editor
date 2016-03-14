AutoForm.addInputType('froalaEditor', {
    template:"afFroalaEditor",
    valueOut: function(){
        return $(this).froalaEditor('html.get', true, true);
    }
});

Template.afFroalaEditor.helpers({
    atts: function(){
        var atts = _.clone(this.atts);
        // Remove froalaOptions so doesn't get rendered as html attrib
        delete atts.froalaOptions;
        return atts
    }
});

Template.afFroalaEditor.onRendered(function(){
    var id = this.data.atts.id;
    var afDropdownOptions = this.data.atts.froalaOptions;
    var froala_skel = {
        inlineMode: false,
        buttons: [],
        customDropdowns: {},
        height: '400',
        imageUploadURL: '/upload_image_froala'
    }
    // Assign basic editor variables
    if(afDropdownOptions.height)
        froala_skel.height = afDropdownOptions.height;
    if(afDropdownOptions.inlineMode)
        froala_skel.inlineMode = afDropdownOptions.inlineMode;
    if(!afDropdownOptions.buttons)
        afDropdownOptions.buttons = [
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'subscript',
        'superscript',
        'fontFamily',
        'fontSize',
        'color',
        'formatBlock',
        'blockStyle',
        'inlineStyle',
        'align',
        'insertOrderedList',
        'insertUnorderedList',
        'outdent',
        'indent',
        'selectAll',
        'createLink',
        'insertImage',
        'insertVideo',
        'table',
        'undo',
        'redo',
        'html',
        'insertHorizontalRule',
        'uploadFile',
        'removeFormat',
        'fullscreen',
        'sep'
        ]
    froala_skel.toolbarButtons = afDropdownOptions.buttons;
    froala_skel.toolbarButtonsMD = afDropdownOptions.buttons;
    froala_skel.toolbarButtonsXS = afDropdownOptions.buttons;
    if(afDropdownOptions.imageUploadURL)
        froala_skel.imageUploadURL=afDropdownOptions.imageUploadURL



    // The custom popup is defined inside a plugin (new or existing).
    $.FroalaEditor.PLUGINS.customPlugin = function (editor) {
        // Create custom popup.
        function initPopup () {
            // Popup buttons.
            var popup_buttons = '';

            // Create the list of buttons.
            if (editor.opts.popupButtons && editor.opts.popupButtons.length > 1) {
                popup_buttons += '<div class="fr-buttons">';
                popup_buttons += editor.button.buildList(editor.opts.popupButtons);
                popup_buttons += '</div>';
            }

            // Load popup template.
            var template = {
                buttons: popup_buttons,
                custom_layer: "<div id='customPopup' style='max-width:50%'></div>"
            };

            // Create popup.
            var $popup = editor.popups.create('customPlugin.popup', template);

            return $popup;
        }

        // Show the popup
        function showPopup (btn, template, data) {
            // Get the popup object defined above.
            var $popup = editor.popups.get('customPlugin.popup');

            // If popup doesn't exist then create it.
            // To improve performance it is best to create the popup when it is first needed
            // and not when the editor is initialized.
            if (!$popup) $popup = initPopup();

            // Set the editor toolbar as the popup's container.
            editor.popups.setContainer('customPlugin.popup', editor.$tb);

            // This will trigger the refresh event assigned to the popup.
            // editor.popups.refresh('customPlugin.popup');

            // This custom popup is opened by pressing a button from the editor's toolbar.
            // Get the button's object in order to place the popup relative to it.
            var $btn = editor.$tb.find('.fr-command[data-cmd="'+btn+'"]');

            // Set the popup's position.
            var left = $btn.offset().left + $btn.outerWidth() / 2;
            var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);

            // Show the custom popup.
            // The button's outerHeight is required in case the popup needs to be displayed above it.
            editor.popups.show('customPlugin.popup', left, top, $btn.outerHeight());
        }

        // Hide the custom popup.
        function hidePopup () {
            editor.popups.hide('customPlugin.popup');
        }

        // Methods visible outside the plugin.
        return {
            showPopup: showPopup,
            hidePopup: hidePopup
        }
    }


    if(afDropdownOptions.customPopups){
        $.each(afDropdownOptions.customPopups, function(name,popup){


            // Define popup template.
            $.extend($.FroalaEditor.POPUP_TEMPLATES, {
                "customPlugin.popup": '[_CUSTOM_LAYER_]'
            });




            // Define an icon and command for the button that opens the custom popup.
            $.FroalaEditor.DefineIcon('button-'+name, { NAME: "lg "+popup.icon})
            $.FroalaEditor.RegisterCommand('button-'+name, {
                title: popup.title  ,
                icon: 'button-'+name,
                undo: false,
                focus: false,
                plugin: 'plugin-'+name,
                callback: function () {
                    this.customPlugin.showPopup('button-'+name, popup.template, popup.data);
                    $("#customPopup").html("");
                    Blaze.renderWithData(Template[popup.template], _.extend(popup.data, {editorID: id}), $("#customPopup")[0]);
                }
            });
            if(froala_skel.toolbarButtons.indexOf('button-'+name)==-1)
                froala_skel.toolbarButtons.push('button-'+name);





        });
    }

    // Make sure all dropdowns are added to buttons
    $.each(afDropdownOptions.customDropdowns,function(key, val){
        if(typeof afDropdownOptions.customDropdowns[key].options === "function")
            afDropdownOptions.customDropdowns[key].options = afDropdownOptions.customDropdowns[key].options()
        if(froala_skel.toolbarButtons.indexOf(key)==-1)
            froala_skel.toolbarButtons.push(key);
    });
    // Assign dropdowns
    froala_skel.customDropdowns = afDropdownOptions.customDropdowns;
    // Convert each of the dropdowns options from string to function format
    _.each(afDropdownOptions.customDropdowns, function(dd, name)
    {
        if(!dd.inverted)
            dd.options = _.invert(dd.options)
        dd.inverted = true
        $.FroalaEditor.DefineIcon(name, {NAME: "lg "+dd.icon.value});
        $.FroalaEditor.RegisterCommand(name, {
            title: dd.title,
            type: 'dropdown',
            focus: false,
            undo: false,
            refreshAfterCallback: true,
            options: dd.options,
            callback: function (cmd, val) {
                this.html.insert(val);
            }
        });
    })
    // Enable editor using converted skeleton data
    if ($('#' + id).data('fa.editable')) {
        $('#' + id).froalaEditor('destroy');
    }
    $('#' + id).froalaEditor(froala_skel);
});
