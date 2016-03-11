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
