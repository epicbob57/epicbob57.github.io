<?php
    $URL = "https://kiwiirc.com/client/irc.chat.twitch.tv/?nick=epicbob57&theme=basic#failstream"

    $domain = file_get_contents($URL)

    echo $domain
?>
