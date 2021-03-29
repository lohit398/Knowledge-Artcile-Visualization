import { LightningElement, wire, track, api } from 'lwc';
import getCategoryStructures from '@salesforce/apex/KnowledgeTreeVisualizer_Helper.getCategoryStructures';
import getKnowledgeArticles from '@salesforce/apex/KnowledgeTreeVisualizer_Helper.getKnowledgeArticles';

export default class KnowledgeArticleTreeVisualizer extends LightningElement {

    @track categories = []; // Tree data (Categories) goes into this variable
    @api recordId; //input variable to get clicked knowledge article Id

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
            this.categories = JSON.parse(JSON.stringify(this.categories).replaceAll('childCategories', 'items').replaceAll('"items":[]', '"items":[{"label":"No Articles","name":"No Articles","items":[]}]'));
            console.log(JSON.stringify(this.categories));
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
                //console.log(data);
            }).catch(error => {
                console.log(error);
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
        //console.log(JSON.stringify(categoryTree));
        this.categories = JSON.parse(JSON.stringify(categoryTree));
    }

    /*TRAVERSE through nested objects and update the tree*/
    traverseUpdateTree(category, article, articleDataCategoryName) {
        category.map(item => {
            if (item.label === articleDataCategoryName) {
                //console.log(JSON.stringify(item));
                if (item.items.length === 1) {
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
        if (event.detail.name != "No Articles") {
            const evt = new CustomEvent('articleselected', { detail: event.detail.name });
            this.dispatchEvent(evt);
        }
    }
}