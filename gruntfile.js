module.exports = function(grunt) {
    grunt.initConfig({
        cssmin: {
            main: {
                files: {
                    'daterangepicker-bs2.min.css': ['daterangepicker-bs2.css'],
                    'daterangepicker-bs3.min.css': ['daterangepicker-bs3.css']
                }
            }
        },
        uglify: {
            main: {
                options:{
                    sourceMap: true,
                },
                files: {
                    'daterangepicker.min.js': ['daterangepicker.js']
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['cssmin', 'uglify']);
}

