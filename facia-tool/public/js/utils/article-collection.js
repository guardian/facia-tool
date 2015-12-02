export default function(article) {
    return article.group.parentType === 'Collection' ? article.group.parent : article.group.parent.group.parent;
}

