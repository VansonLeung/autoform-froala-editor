AutoForm.addInputType('froalaEditor', {
    template:"afFroalaEditor",
    valueOut: function(){
        return $(this).editable('getHTML', true, true);
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
    var id = this.data.atts['data-schema-key'];
    var afDropdownOptions = this.data.atts.froalaOptions;
    var froala_skel = {
        inlineMode: false,
        buttons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'color', 'formatBlock', 'blockStyle', 'inlineStyle', 'align', 'insertOrderedList', 'insertUnorderedList', 'outdent', 'indent', 'selectAll', 'createLink', 'insertImage', 'insertVideo', 'table', 'undo', 'redo', 'html', 'insertHorizontalRule', 'uploadFile', 'removeFormat', 'fullscreen'],
        customDropdowns: {},
        imageUploadURL: '/upload_image_froala'
    }

    // Assign basic editor variables
    if(afDropdownOptions.height)
        froala_skel.height = afDropdownOptions.height;
    if(afDropdownOptions.inlineMode)
        froala_skel.inlineMode = afDropdownOptions.inlineMode;
    if(afDropdownOptions.buttons)
        froala_skel.buttons = afDropdownOptions.buttons;
    if(afDropdownOptions.imageUploadURL)
        froala_skel.imageUploadURL=afDropdownOptions.imageUploadURL

    // Make sure all dropdowns are added to buttons
    if(afDropdownOptions.customDropdowns) {
        $.each(afDropdownOptions.customDropdowns, function (key, val) {
            if (froala_skel.buttons.indexOf(key) == -1)
                froala_skel.buttons.push(key);
        });

        // Assign dropdowns
        froala_skel.customDropdowns = afDropdownOptions.customDropdowns;

        // Convert each of the dropdowns options from string to function format
        froala_skel.customDropdowns = convertDropdowns(froala_skel.customDropdowns);
    }

    // Enable editor using converted skeleton data
    if($('[data-schema-key='+id+"]").data('fa.editable')) {
        $('[data-schema-key='+id+"]").editable('destroy');
    }
    $('[data-schema-key='+id+"]").editable(froala_skel);
});


// Converts options params from strings
// to functions
function convertDropdowns(dropdowns){
    Object.keys(dropdowns).forEach(function(val){
        dropdowns[val].options = convertOptions(dropdowns[val].options);
    });
    return dropdowns;
}

function convertOptions(options){
    var newOptions = Object.keys(options).reduce(function ( obj, option ) {
        if(typeof options[ option ] == 'string')
            obj[ option ] = function () {
                this.insertHTML(options[ option ]);
            };
        else
            obj[ option ]=options[ option ]
        return obj;
    }, {});
    return newOptions;
}

