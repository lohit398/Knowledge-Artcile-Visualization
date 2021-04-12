import { LightningElement, wire, track, api } from 'lwc';
import getCategoryStructures from '@salesforce/apex/KnowledgeTreeVisualizer_Helper.getCategoryStructures';
import getKnowledgeArticles from '@salesforce/apex/KnowledgeTreeVisualizer_Helper.getKnowledgeArticles';
import getKnowledgeArticle from '@salesforce/apex/KnowledgeTreeVisualizer_Helper.getKnowledgeArticle';

export default class KnowledgeArticleTreeVisualizer extends LightningElement {

    @track categories = []; // Tree data (Categories) goes into this variable
    @api recordId; //input variable to get clicked knowledge article Id
    searchedArticleId;
    __initialSelected;

    /*This is the wire method to get data category tree*/
    @wire(getCategoryStructures)
    getAllCategoryStructures({ error, data }) {
        if (error)
            console.log(error);
        else if (data) {
            /*Parsed the content to make it available in tree structure */
            this.categories = JSON.parse(data).map((item) => {
                let group = {};
                group.label = item.label;
                group.name = item.label;
                group.items = item.topCategories[0].childCategories.map(category => {
                    return category;
                });
                return group;
            })
            this.categories = JSON.parse(JSON.stringify(this.categories).replaceAll('childCategories', 'items').replaceAll('"items":[]', '"items":[{"label":"Oops!!","metatext":"No Articles","name":"","items":[]}]'));
            this.getKnowledgeArticles();

        }
    }

    getKnowledgeArticles() {
        getKnowledgeArticles()
            .then(data => {
                JSON.parse(JSON.stringify(data)).map(item => {
                    let articleDataCategoryGroup = item.DataCategoryGroupName;
                    let articleDataCategoryName = item.DataCategoryName;
                    let article = item;
                    this.insertArticles(articleDataCategoryName, article, articleDataCategoryGroup);
                })
                if (this.recordId != undefined && this.recordId != null) {
                    this.getArticlesById(this.recordId,"");
                }

            }).catch(error => {
                console.log(error);
            })
    }

    getArticlesById(articleId, category) {
        getKnowledgeArticle({ articleId: articleId, articleCategory: category })
            .then(data => {
                let categoryTree = this.categories;
                for (let i = 0; i < categoryTree.length; i++) {
                    if (categoryTree[i].name === data.DataCategoryGroupName) {
                        categoryTree[i].expanded = true;
                        this.findArticle(categoryTree[i].items, data.DataCategoryName);
                        
                    }
                    else{
                        categoryTree[i].expanded = false;
                    }
                }
                this.categories = JSON.parse(JSON.stringify(categoryTree));
            })
    }

    /*Traverse through objects*/
    insertArticles(articleDataCategoryName, article, articleDataCategoryGroup) {
        let categoryTree = this.categories;
        for (let i = 0; i < categoryTree.length; i++) {
            if (categoryTree[i].label === articleDataCategoryGroup) {
                this.traverseUpdateTree(categoryTree[i].items, article, articleDataCategoryName);
            }
        }

        this.categories = JSON.parse(JSON.stringify(categoryTree));
    }

    /*TRAVERSE through nested objects and update the tree*/
    traverseUpdateTree(category, article, articleDataCategoryName) {
        category.map(item => {

            if (item.label === articleDataCategoryName) {
                if (item.items.length === 1) {
                    if (item.items[0].name === "")
                        item.items.pop();
                }
                let obj = {};
                obj.label = article.Parent.Title;
                obj.name = article.Parent.Id;
                obj.items = [];
                item.items.push(obj);
            } else if (item.items.length != 0) {
                this.traverseUpdateTree(item.items);
            }
        })
    }

    /*Getting the selecting article and making it available to the customer*/
    handleArticleSelect(event) {
        if (event.detail.name != "") {
            const evt = new CustomEvent('articleselected', { detail: event.detail.name });
            this.dispatchEvent(evt);
        }
    }
    /*Article Searched*/
    handleArticleSearch(event) {
        this.searchedArticleId = event.detail.articleId;
        //console.log(event.detail.categoryName);
        if (this.searchedArticleId != undefined && this.searchedArticleId != null) {
            this.getArticlesById(this.searchedArticleId,event.detail.categoryName);
        }
        const evt = new CustomEvent('articleselected', { detail: event.detail.articleId });
        this.dispatchEvent(evt);
    }

    /*Traverse to find the article and expand*/
    findArticle(categoryTree, dataCategory) {
        for (let i = 0; i < categoryTree.length; i++) {
            if (categoryTree[i].name === dataCategory) {
                categoryTree[i].expanded = true;
                return;
            }
            else if (categoryTree[i].items.length != 0) {
                categoryTree[i].expanded = false;
                this.findArticle(categoryTree[i].items, dataCategory)
            }
        }
    }
}