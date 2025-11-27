
//WEB O.KROMA//
//¿COMO EDITAR EL CONTENIDO??

En 3 simples pasos

***** PASO 1 *****
- en la carpeta "media" crear una carpeta (Cada carpeta es un post diferente) o abrir alguna de las existentes para modificar ese post
- dentro de esta carpeta se pueden añadir fotos, videos o archivos de texto
----- formatos admitidos:

supportedImageFormats: ["jpg","jpeg","png","gif","webp","svg","bmp",]
supportedVideoFormats: ["mp4", "webm", "ogv", "mov"]
supportedTextFormats: ["txt", "md"]   *** el texto acepta etiquetas de html, por ejemplo <b> hola </b> pondrá el texto en negrita

** Recomiendo tener cuidado con el peso de los archivos, cuanto más pesen más tardan en cargar luego, 
mi recomendación es que las fotos y videos tengan como máximo 500px de ancho más o menos
Y los vídeos tener especial cuidado de que no pesen más de 200-300Mb  porque si no van a tardar varios segundos en cargar.
Los textos si son muy largos van a hacer un post igualmente largo, lo cual puede quedar poco estético, asique tened cuidado con eso también. mi recomendacion es 150-200 palabras máximo

- si se añade más de una foto o un video automáticamente se creará un carrousel
- en el caso de añadir un texto a un carrousel, este aparecerá debajo, pero formará parte del mismo post

***** PASO 2 *****
- editar el post.json (esto es un poco más complicado, cualquier cosa preguntar a calde) se puede editar desde github o desde VisualStudioCode
- en caso de querer que lo edite calde, igualmente es mucho más fácil si le pasáis esta info en un whatsapp o algo
- para añadir un nuevo post solo hay que escribir el nuevo post entre llaves { }  los post estarán separados por "," así:

{
    "post": [
        {
            // este es el primer post
        },
        {
            // este es el segundo post
        }
    ]
}

- dentro de las llaves, podemos escribir las propiedades que va a tener ese post.
la única que es imprescinidible es la de "folder", donde tendremos que poner el nombre de la carpeta que hemos creado en el paso 1 así:

"folder": "2" 

esto indica que el nombre que tiene que buscar es 2, asegurarse de que todo está entre ""

- Se pueden añadir más propiedades separadas por "," hay estas:

"title": añade un titulo debajo de la publicación, solo hay que escribirlo entre ""
"autoplay": puede ser "true" o "false". si el post es un carrousel y escribimos "true", hace que se mueva de forma automática.
"link": convierte el post en un link que al clicarlo te lleva a otra pagina, hay que escribirlo entre "" y puede ser un link externo o un link interno con path relativo (esto igual preguntarselo a calde también)
"background": cambia el color de fondo del post, a efectos prácticos esto solo se nota cuando añadimos un texto, el color se tiene que añadir en formato hexadecimal "#ffac00"

un ejemplo de post sería:

        {
            "folder": "1",
            "title": "La Recolectora",
            "autoplay": "true",
            "link": "https://larecolectora.com/",
            "background": "#ffffff"
        }
**IMPORTANTE: Todo entre "" y las propiedades estan separadas por "," pero la última propiedad no lleva "," al final, lo mismo con los post entre { }
Un post no tiene por qué tener todas las propiedades, puede tener 1, 2 o 3 o todas, la única realmente imprescindible es la de "folder"

- guardar el json (ctrl + S)


***** PASO 3 *****

- este paso al principio se lo pediréis a calde, pero para quien quiera tener el poder:
- generar los json de cada post de forma automática, para ello hay que abrir una terminal en visualStudioCode, instalar node si no lo tenemos instalado y asegurándose que estamos en la carpeta web_okroma
escribir el comando node generate-indexes.js y darle a intro.
- una vez generado estos archivos sin errores solo queda hacer commit de los cambios a github (asegurarse de poner siempre algo en message) y darle a Sync. Esto actualiza automáticamente la web en vercel








