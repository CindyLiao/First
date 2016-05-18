/**
 * Created by yuzaizai on 2016/4/17.
 */
module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            jade: {
                files: ['views/**'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'],
                //tasks: ['jshint'],
                options: {
                    livereload: true
                }
            }
        },



        nodemon: {
            dev: {
                options: {
                    file: 'app.js',
                    args: [],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['./'],
                    debug: true,
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },

        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    });
    grunt.option('force',true);//防止文件中警告和语法错误中断了grunt服务
    grunt.loadNpmTasks('grunt-contrib-watch') //监测文件的增删改查
    grunt.loadNpmTasks('grunt-nodemon')//app.js 监听
    grunt.loadNpmTasks('grunt-concurrent')//慢任务的监听css、less以及阻塞任务的监听例如watch、nodemon

    grunt.registerTask('default', ['concurrent'])
};