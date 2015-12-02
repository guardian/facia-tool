export default function(article) {
    if (article.group.parentType === 'Collection') {
        return article.group.parent;
    } else if (article.group.parentType === 'Article') {
        // sublink
        return article.group.parent.group.parent;
    }
    // else clipboard
}

